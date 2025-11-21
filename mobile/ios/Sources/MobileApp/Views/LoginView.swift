import SwiftUI

struct LoginView: View {
    @EnvironmentObject var auth: AuthViewModel
    @State private var email = "stephan.reese@gmail.com"
    @State private var password = ""
    @State private var errorMessage: String?
    @State private var showingSignUp = false

    var body: some View {
        VStack(spacing: 16) {
            Text("RealEstate CRM").font(.largeTitle)
            
            VStack(spacing: 12) {
                TextField("Email", text: $email)
                    .keyboardType(.emailAddress)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                SecureField("Password", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
            
            if let error = errorMessage {
                Text(error)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            
            Button("Sign In") {
                Task {
                    do {
                        errorMessage = nil
                        try await auth.signIn(email: email, password: password)
                    } catch let error as APIError {
                        errorMessage = error.localizedDescription
                    } catch {
                        errorMessage = error.localizedDescription
                    }
                }
            }
            .disabled(email.isEmpty || password.isEmpty)
            .buttonStyle(.borderedProminent)
            
            Button("Don't have an account? Sign Up") {
                showingSignUp = true
            }
            .foregroundColor(.blue)
            
            Spacer()
        }
        .padding()
        .sheet(isPresented: $showingSignUp) {
            SignUpView()
        }
    }
}
