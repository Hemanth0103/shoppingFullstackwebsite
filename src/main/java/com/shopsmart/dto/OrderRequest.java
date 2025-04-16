package com.shopsmart.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    private List<OrderItemRequest> items;
    private double subtotal;
    private double discount;
    private double total;
    private String discountTier;
    private ShippingDetailsRequest shippingDetails;

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private String productName;
        private int quantity;
        private double price;
    }

    @Data
    public static class ShippingDetailsRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String address;
        private String city;
        private String postalCode;
        private String country;
    }
}
