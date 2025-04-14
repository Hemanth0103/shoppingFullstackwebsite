package com.shopsmart.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopsmart.model.Product;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = getProductList();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        List<Product> products = getProductList();
        for (Product product : products) {
            if (product.getId().equals(id)) {
                return ResponseEntity.ok(product);
            }
        }
        return ResponseEntity.notFound().build();
    }

    private List<Product> getProductList() {
        List<Product> products = new ArrayList<>();

        products.add(new Product(1L, "Wireless Bluetooth Headphones",
                "Premium noise-cancelling headphones with crystal clear sound quality and 20-hour battery life.",
                199.99, "/images/WirelessBluetoothHeadphones.jpeg", "Electronics"));

        products.add(new Product(2L, "Smartphone Pro Max",
                "The latest flagship smartphone with a stunning 6.7-inch display and professional-grade camera.",
                999.99, "/images/SmartphoneProMax.jpeg", "Electronics"));

        products.add(new Product(3L, "Ultra HD Smart TV",
                "65-inch 4K Ultra HD Smart TV with HDR and built-in streaming apps.",
                799.99, "/images/UltraHDSmartTV.jpeg", "Electronics"));

        products.add(new Product(4L, "Premium Coffee Maker",
                "Programmable coffee maker with built-in grinder and multiple brewing options.",
                149.99, "/images/PremiumCoffeeMaker.jpeg", "Home & Kitchen"));

        products.add(new Product(5L, "Ergonomic Office Chair",
                "Adjustable ergonomic office chair with lumbar support and breathable mesh back.",
                249.99, "/images/ErgonomicOfficeChair.jpeg", "Home & Kitchen"));

        products.add(new Product(6L, "Designer Leather Jacket",
                "Premium genuine leather jacket with stylish design and comfortable fit.",
                299.99, "/images/DesignerLeatherJacket.jpeg", "Clothing"));

        products.add(new Product(7L, "Fitness Smartwatch",
                "Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life.",
                179.99, "/images/FitnessSmartwatch.jpg", "Electronics"));

        products.add(new Product(8L, "Portable Bluetooth Speaker",
                "Waterproof portable speaker with 360° sound and 12-hour battery life.",
                89.99, "/images/PortableBluetoothSpeaker.jpeg", "Electronics"));

        return products;
    }
}