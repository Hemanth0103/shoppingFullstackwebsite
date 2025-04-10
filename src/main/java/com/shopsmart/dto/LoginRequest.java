package com.shopsmart.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class LoginRequest {
    private String email;
    private String password;
}
