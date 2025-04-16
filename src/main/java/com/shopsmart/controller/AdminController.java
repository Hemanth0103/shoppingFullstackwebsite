package com.shopsmart.controller;

import com.shopsmart.model.User;
import com.shopsmart.model.Order;
import com.shopsmart.repository.UserRepository;
import com.shopsmart.repository.OrderRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        try {
            // Get total users
            long userCount = userRepository.count();
            model.addAttribute("userCount", userCount);

            // Get total revenue and orders
            List<Order> allOrders = orderRepository.findAll();
            double totalRevenue = allOrders.stream()
                    .filter(order -> order.getTotal() != null && order.getTotal() != 0.0)
                    .mapToDouble(Order::getTotal)
                    .sum();
            model.addAttribute("totalRevenue", totalRevenue);

            // Get orders today
            LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
            LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);
            long ordersToday = allOrders.stream()
                    .filter(order -> {
                        LocalDateTime orderDate = order.getOrderDate();
                        return orderDate != null &&
                                orderDate.isAfter(startOfDay) &&
                                orderDate.isBefore(endOfDay);
                    })
                    .count();
            model.addAttribute("ordersToday", ordersToday);

            // Get active users (last 24 hours)
            LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
            long activeUsers = allOrders.stream()
                    .filter(order -> order.getOrderDate() != null && order.getOrderDate().isAfter(yesterday))
                    .filter(order -> order.getUser() != null)
                    .map(order -> order.getUser().getId())
                    .distinct()
                    .count();
            model.addAttribute("activeUsers", activeUsers);

            // Get recent users (last 10)
            List<User> recentUsers = userRepository.findAll(PageRequest.of(0, 10, Sort.by("id").descending()))
                    .getContent();
            model.addAttribute("recentUsers", recentUsers);

            // Get revenue data for chart (last 7 days)
            List<Map<String, Object>> revenueData = new ArrayList<>();
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7).with(LocalTime.MIN);
            
            Map<LocalDateTime, Double> dailyRevenue = allOrders.stream()
                    .filter(order -> order.getOrderDate() != null && order.getOrderDate().isAfter(sevenDaysAgo))
                    .filter(order -> order.getTotal() != null)
                    .collect(Collectors.groupingBy(
                        order -> order.getOrderDate().with(LocalTime.MIN),
                        Collectors.summingDouble(Order::getTotal)
                    ));

            LocalDateTime date = sevenDaysAgo;
            while (!date.isAfter(LocalDateTime.now())) {
                Map<String, Object> dayData = new HashMap<>();
                dayData.put("date", date.toLocalDate().toString());
                dayData.put("amount", dailyRevenue.getOrDefault(date, 0.0));
                revenueData.add(dayData);
                date = date.plusDays(1);
            }
            model.addAttribute("revenueData", revenueData);

            model.addAttribute("activePage", "dashboard");

            logger.info("Dashboard data loaded successfully");
            return "admin/dashboard";
        } catch (Exception e) {
            logger.error("Error in dashboard: ", e);
            model.addAttribute("error", "An error occurred while loading the dashboard");
            return "error";
        }
    }

    @GetMapping("/users")
    public String userManagement(@RequestParam(defaultValue = "0") int page, Model model) {
        try {
            Page<User> userPage = userRepository.findAll(PageRequest.of(page, 10, Sort.by("id")));
            model.addAttribute("users", userPage.getContent());
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", userPage.getTotalPages());
            model.addAttribute("activePage", "users");
            return "admin/users";
        } catch (Exception e) {
            logger.error("Error in user management: ", e);
            model.addAttribute("error", "An error occurred while loading the user list");
            return "error";
        }
    }

    @DeleteMapping("/users/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isPresent()) {
                userRepository.delete(userOpt.get());
                return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }
        } catch (Exception e) {
            logger.error("Error deleting user: ", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Error deleting user"));
        }
    }

    @GetMapping("/users/{id}")
    @ResponseBody
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        try {
            return userRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error getting user: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/users/{id}")
    @ResponseBody
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            return userRepository.findById(id)
                    .map(user -> {
                        if ("ADMIN".equals(user.getRole()) && !"ADMIN".equals(updatedUser.getRole())) {
                            return ResponseEntity.badRequest()
                                .body(Map.of("message", "Cannot remove admin role"));
                        }
                        
                        user.setUsername(updatedUser.getUsername());
                        user.setEmail(updatedUser.getEmail());
                        user.setGender(updatedUser.getGender());
                        user.setAge(updatedUser.getAge());
                        user.setRole(updatedUser.getRole());
                        userRepository.save(user);
                        return ResponseEntity.ok(Map.of("message", "User updated successfully"));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error updating user: ", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "An error occurred while updating the user"));
        }
    }

    @GetMapping("/users/export")
    public void exportUsers(HttpServletResponse response) {
        try {
            response.setContentType("text/csv");
            response.setHeader("Content-Disposition", "attachment; filename=users.csv");
            
            var writer = response.getWriter();
            writer.write("ID,Username,Email,Gender,Age,Role,Total Spent\n");
            
            userRepository.findAll().forEach(user -> {
                try {
                    writer.write(String.format("%d,%s,%s,%s,%d,%s,%.2f\n",
                        user.getId(),
                        escapeCsv(user.getUsername()),
                        escapeCsv(user.getEmail()),
                        escapeCsv(user.getGender()),
                        user.getAge(),
                        escapeCsv(user.getRole()),
                        user.getTotalSpent()
                    ));
                } catch (Exception e) {
                    logger.error("Error writing user to CSV: ", e);
                }
            });
            
            writer.flush();
        } catch (Exception e) {
            logger.error("Error exporting users: ", e);
        }
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
