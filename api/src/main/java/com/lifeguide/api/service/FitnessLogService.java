package com.lifeguide.api.service;

import com.lifeguide.api.dto.FitnessLogDto;
import com.lifeguide.api.model.FitnessLog;
import com.lifeguide.api.model.User;
import com.lifeguide.api.repository.FitnessLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FitnessLogService {

    private final FitnessLogRepository fitnessLogRepository;
    private final UserService userService;

    public FitnessLogService(FitnessLogRepository fitnessLogRepository, UserService userService) {
        this.fitnessLogRepository = fitnessLogRepository;
        this.userService = userService;
    }

    public List<FitnessLog> getLogsForUser(String auth0Id) {
        User user = userService.getUserByAuth0Id(auth0Id);
        return fitnessLogRepository.findByUserOrderByRecordedAtAsc(user);
    }

    @Transactional
    public FitnessLog addLog(String auth0Id, FitnessLogDto dto) {
        User user = userService.getUserByAuth0Id(auth0Id);
        
        FitnessLog log = new FitnessLog(user, dto.getWeightKg());
        FitnessLog savedLog = fitnessLogRepository.save(log);

        // Update the user's current weight as well
        user.setCurrentWeightKg(dto.getWeightKg());
        
        return savedLog;
    }
}
