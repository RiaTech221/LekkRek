package com.lekkrek.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("${api.prefix.public}")
public class PublicController {

    @GetMapping("/ping")
    public String ping() {
        return "Bienvenue sur l'API Lekk Rek ! L'architecture tourne parfaitement.";
    }
}
