The service layer will manage input and output for different clients based on each specific use case.

For example, suppose your domain use case involves calculating revenue recognition. Afterwrds, you might need to send an email. In such a situation, the service layer will invoke your domain class to handle the use case, then send the email with use case's response.

