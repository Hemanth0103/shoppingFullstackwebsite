package com.shopsmart.controller;

import com.shopsmart.dto.OrderRequest;
import com.shopsmart.model.Order;
import com.shopsmart.model.OrderItem;
import com.shopsmart.model.ShippingDetails;
import com.shopsmart.model.User;
import com.shopsmart.repository.OrderRepository;
import com.shopsmart.repository.UserRepository;
import com.shopsmart.service.EmailService;
import com.shopsmart.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest, @CookieValue("auth_token") String token) {
        try {
            String email = jwtService.extractUsername(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Order order = new Order();
            order.setUser(user);
            order.setSubtotal(orderRequest.getSubtotal());
            order.setDiscount(orderRequest.getDiscount());
            order.setTotal(orderRequest.getTotal());
            order.setDiscountTier(orderRequest.getDiscountTier());

            ShippingDetails shippingDetails = new ShippingDetails(
                    orderRequest.getShippingDetails().getFirstName(),
                    orderRequest.getShippingDetails().getLastName(),
                    orderRequest.getShippingDetails().getEmail(),
                    orderRequest.getShippingDetails().getAddress(),
                    orderRequest.getShippingDetails().getCity(),
                    orderRequest.getShippingDetails().getPostalCode(),
                    orderRequest.getShippingDetails().getCountry()
            );
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

            // Update user's total spent
            user.setTotalSpent(user.getTotalSpent() + order.getTotal());
            userRepository.save(user);

            // Save order
            Order savedOrder = orderRepository.save(order);

            // Send confirmation email
            emailService.sendOrderConfirmation(user.getEmail(), savedOrder);

            return ResponseEntity.ok(Map.of(
                    "message", "Order created successfully",
                    "orderId", savedOrder.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserOrders(@CookieValue("auth_token") String token) {
        try {
            String email = jwtService.extractUsername(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(user);
            return ResponseEntity.ok(orders);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
