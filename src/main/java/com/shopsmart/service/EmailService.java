package com.shopsmart.service;

import com.shopsmart.model.Order;
import com.shopsmart.model.OrderItem;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.text.DecimalFormat;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    public void sendOrderConfirmation(String to, Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Order Confirmation - ShopSmart #" + order.getId());

            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("items", order.getItems());
            context.setVariable("shipping", order.getShippingDetails());

            DecimalFormat df = new DecimalFormat("0.00");
            context.setVariable("subtotal", df.format(order.getSubtotal()));
            context.setVariable("discount", df.format(order.getDiscount()));
            context.setVariable("total", df.format(order.getTotal()));

            String emailContent = templateEngine.process("order-confirmation", context);
            helper.setText(emailContent, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            // Log the error but don't stop the order process
            e.printStackTrace();
        }
    }
}
