package com.lekkrek.controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/v1/public")
public class TestSecurityController {
    @GetMapping("/test-auth")
    public String testAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return "No auth";
        return auth.getName() + " " + auth.getAuthorities().toString();
    }
}
