package com.shopsmart.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
<<<<<<< HEAD
    @JoinColumn(name = "user_id")
=======
    @JoinColumn(name = "user_id", nullable = false)
>>>>>>> 4b6f15fc09983272ba20d3e0655deb49377a27c5
    @JsonBackReference
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<OrderItem> items = new ArrayList<>();

<<<<<<< HEAD
    @Column(nullable = false)
    private Double subtotal = 0.0;

    @Column(nullable = false)
    private Double discount = 0.0;

    @Column(nullable = false)
    private Double total = 0.0;

=======
    private double subtotal;
    private double discount;
    private double total;
>>>>>>> 4b6f15fc09983272ba20d3e0655deb49377a27c5
    private String discountTier;

    @Column(nullable = false)
    private LocalDateTime orderDate = LocalDateTime.now();

    @Embedded
    private ShippingDetails shippingDetails;
<<<<<<< HEAD

    // Helper method to calculate total
    @PrePersist
    @PreUpdate
    public void calculateTotal() {
        if (subtotal == null) subtotal = 0.0;
        if (discount == null) discount = 0.0;
        total = subtotal - discount;
        if (total < 0) total = 0.0;
    }
=======
>>>>>>> 4b6f15fc09983272ba20d3e0655deb49377a27c5
}
