package com.shopsmart.service;

import com.shopsmart.model.User;
import com.shopsmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
<<<<<<< HEAD
import org.springframework.security.core.authority.SimpleGrantedAuthority;
=======
>>>>>>> 4b6f15fc09983272ba20d3e0655deb49377a27c5
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

<<<<<<< HEAD
import java.util.Collections;
=======
import java.util.ArrayList;
>>>>>>> 4b6f15fc09983272ba20d3e0655deb49377a27c5

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
<<<<<<< HEAD
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
=======
                new ArrayList<>()
>>>>>>> 4b6f15fc09983272ba20d3e0655deb49377a27c5
        );
    }
}