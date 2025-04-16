package com.shopsmart.service;

import com.shopsmart.model.Order;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderConfirmation(String to, Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Your ShopSmart Purchase Details #" + order.getId());
            helper.setFrom("hemuh3614@gmail.com");

            StringBuilder emailContent = new StringBuilder();
            emailContent.append("<h2>Thank you for your purchase!</h2>");
            emailContent.append("<h3>Order #").append(order.getId()).append("</h3>");
            emailContent.append("<h4>Items purchased:</h4>");
            emailContent.append("<ul>");
            
            order.getItems().forEach(item -> {
                emailContent.append("<li>")
                    .append(item.getProductName())
                    .append(" x ").append(item.getQuantity())
                    .append(" - $").append(String.format("%.2f", item.getPrice() * item.getQuantity()))
                    .append("</li>");
            });
            
            emailContent.append("</ul>");
            emailContent.append("<p>Subtotal: $").append(String.format("%.2f", order.getSubtotal())).append("</p>");
            if (order.getDiscount() > 0) {
                emailContent.append("<p>Discount: -$").append(String.format("%.2f", order.getDiscount())).append("</p>");
            }
            emailContent.append("<p><strong>Total: $").append(String.format("%.2f", order.getTotal())).append("</strong></p>");
            emailContent.append("<p>Shipping to:</p>");
            emailContent.append("<p>").append(order.getShippingDetails().getFirstName())
                .append(" ").append(order.getShippingDetails().getLastName()).append("<br>")
                .append(order.getShippingDetails().getAddress()).append("<br>")
                .append(order.getShippingDetails().getCity()).append(", ")
                .append(order.getShippingDetails().getPostalCode()).append("<br>")
                .append(order.getShippingDetails().getCountry()).append("</p>");

            helper.setText(emailContent.toString(), true);
            mailSender.send(message);

        } catch (MessagingException e) {
            System.err.println("Failed to send order email: " + e.getMessage());
            // Don't throw the exception, just log it
        }
    }
}