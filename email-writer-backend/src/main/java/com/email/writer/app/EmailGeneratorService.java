package com.email.writer.app;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {
        //Build the promt
        String prompt = buildPrompt(emailRequest);
        
        // Craft a request
        Map<String, Object> requestBody = Map.of(
            "contents", new Object[] {
                Map.of("parts", new Object[] {
                    Map.of("text", prompt)
                })
            }
        );

        // Do request an dget response
            String response = webClient.post()
            .uri(geminiApiUrl + geminiApiKey)
            .header("Content-Type", "application/json")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .block();


        // Return response
        return extractResponse(response);
            
        }
                
            private String extractResponse(String response) {
                try{
                    // Extract relevant information from the response
                    // For example, extract the generated email content
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode rootNode = mapper.readTree(response);
                    return rootNode.path("candidates")
                     .get(0)
                     .path("content")
                     .path("parts")
                     .get(0)
                     .path("text")
                     .asText();

                } catch (Exception e) {
                    return "Failed to extract response: " + e.getMessage();
                }
            }
        
            private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email reply for the following email content. Please don't generate subject.");

        if(emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Use a  ").append(emailRequest.getTone()).append(" tone\n");
        }
        prompt.append("Here is the email content: \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}
