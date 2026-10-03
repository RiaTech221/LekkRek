package com.lekkrek;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LekkRekApplication {

    public static void main(String[] args) {
        SpringApplication.run(LekkRekApplication.class, args);
    }
}
