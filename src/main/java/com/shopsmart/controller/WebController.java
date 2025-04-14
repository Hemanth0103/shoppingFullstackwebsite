package com.shopsmart.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/")
    public String home(Model model) {
        addAuthToModel(model);
        return "index";
    }

    @GetMapping("/login")
    public String login(Model model) {
        addAuthToModel(model);
        return "login";
    }

    @GetMapping("/signup")
    public String signup(Model model) {
        addAuthToModel(model);
        return "signup";
    }

    @GetMapping("/product-detail")
    public String productDetail(Model model) {
        addAuthToModel(model);
        return "product-detail";
    }

    @GetMapping("/cart")
    public String cart(Model model) {
        addAuthToModel(model);
        return "cart";
    }

    @GetMapping("/checkout")
    public String checkout(Model model) {
        addAuthToModel(model);
        return "checkout";
    }

    @GetMapping("/orders")
    public String orders(Model model) {
        addAuthToModel(model);
        return "orders";
    }

    private void addAuthToModel(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            model.addAttribute("authenticated", true);
            model.addAttribute("username", auth.getName());
        } else {
            model.addAttribute("authenticated", false);
        }
    }
}