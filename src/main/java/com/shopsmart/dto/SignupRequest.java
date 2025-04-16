package com.shopsmart.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private String gender;
    private int age;
}
