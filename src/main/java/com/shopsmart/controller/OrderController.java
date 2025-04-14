package com.shopsmart.controller;

import com.shopsmart.dto.OrderRequest;
import com.shopsmart.model.Order;
import com.shopsmart.model.OrderItem;
import com.shopsmart.model.ShippingDetails;
import com.shopsmart.model.User;
import com.shopsmart.repository.OrderRepository;
import com.shopsmart.repository.UserRepository;
import com.shopsmart.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            User user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Order order = new Order();
            order.setUser(user);
            order.setSubtotal(orderRequest.getSubtotal());
            order.setDiscount(orderRequest.getDiscount());
            order.setTotal(orderRequest.getTotal());
            order.setDiscountTier(orderRequest.getDiscountTier());

            ShippingDetails shippingDetails = new ShippingDetails();
            shippingDetails.setFirstName(orderRequest.getShippingDetails().getFirstName());
            shippingDetails.setLastName(orderRequest.getShippingDetails().getLastName());
            shippingDetails.setEmail(orderRequest.getShippingDetails().getEmail());
            shippingDetails.setAddress(orderRequest.getShippingDetails().getAddress());
            shippingDetails.setCity(orderRequest.getShippingDetails().getCity());
            shippingDetails.setPostalCode(orderRequest.getShippingDetails().getPostalCode());
            shippingDetails.setCountry(orderRequest.getShippingDetails().getCountry());
            order.setShippingDetails(shippingDetails);

            List<OrderItem> items = new ArrayList<>();
            for (OrderRequest.OrderItemRequest itemRequest : orderRequest.getItems()) {
                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProductId(itemRequest.getProductId());
                item.setProductName(itemRequest.getProductName());
                item.setQuantity(itemRequest.getQuantity());
                item.setPrice(itemRequest.getPrice());
                items.add(item);
            }

            order.setItems(items);
            Order savedOrder = orderRepository.save(order);

            user.setTotalSpent(user.getTotalSpent() + order.getTotal());
            userRepository.save(user);

            // Send purchase email without requiring confirmation
            try {
                emailService.sendOrderConfirmation(user.getEmail(), savedOrder);
            } catch (Exception e) {
                // Just log the error and continue
                System.err.println("Failed to send email: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Order created successfully",
                    "orderId", savedOrder.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error creating order: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserOrders() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            User user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(user);
            return ResponseEntity.ok(orders);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}