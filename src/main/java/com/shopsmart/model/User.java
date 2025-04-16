package com.shopsmart.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private int age;

    @Column(nullable = false)
    private String role = "USER"; // Default role

    private double totalSpent = 0.0;

    @OneToMany(mappedBy = "user")
    @JsonManagedReference
    private List<Order> orders;

    public String getTier() {
        if (totalSpent >= 5000) return "Platinum (15% discount)";
        if (totalSpent >= 1000) return "Gold (10% discount)";
        if (totalSpent >= 500) return "Silver (5% discount)";
        return "Regular (No discount)";
    }

    public double getDiscountPercentage() {
        if (totalSpent >= 5000) return 0.15;
        if (totalSpent >= 1000) return 0.10;
        if (totalSpent >= 500) return 0.05;
        return 0.0;
    }
}
