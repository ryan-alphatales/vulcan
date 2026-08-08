# Access & Setup

## Login to Existing Account

**Flow Type:** access_identity
**Scope Status:** required_for_first_version
**Trigger:** Developer returns to Vulcan and needs to resume work.
**Outcome:** Developer is authenticated and lands on their workspace.

### Steps

1. **[user]** Open the Vulcan desktop app
   - Developer launches the Vulcan application on their machine.
2. **[user]** Choose to log in
   - Developer selects the login option on the welcome screen.
3. **[user]** Enter email and password
   - Developer types the credentials they used during sign-up.
4. **[system]** Verify credentials
   - Vulcan checks the email and password against stored account records.
5. **[system]** Route to workspace
   - Vulcan loads the developer's saved repositories, scan history, and triage state.
6. **[user]** Land on the workspace view
   - Developer sees their connected repositories and recent activity ready to resume.

## Sign Up and Create Account

**Flow Type:** access_identity
**Scope Status:** required_for_first_version
**Trigger:** Developer visits Vulcan and chooses to sign up.
**Outcome:** Developer has an authenticated account ready to connect a repository.

### Steps

1. **[user]** Choose Sign Up on Landing Page
   - Developer opens Vulcan and clicks the sign-up button to create a new account.
2. **[user]** Enter Email and Create Password
   - Developer provides their email address and sets a secure password for the account.
3. **[system]** Validate Email Format and Password Strength
   - System checks that the email is valid and the password meets minimum strength requirements.
4. **[system]** Send Verification Email to Inbox
   - System sends a verification link to the provided email address to confirm ownership.
5. **[user]** Click Verification Link in Email
   - Developer opens their inbox and clicks the link to verify the email address.
6. **[system]** Confirm Email and Activate Account
   - System marks the email as verified and activates the developer account.
7. **[user]** Complete Optional Profile Details
   - Developer optionally enters their name so the app can personalise the experience.
8. **[system]** Create Account and Start Session
   - System creates the account record and signs the developer in, showing the workspace.

## Connect a Code Repository

**Flow Type:** onboarding_setup
**Scope Status:** required_for_first_version
**Trigger:** Developer has an account and needs to configure their first repository for scanning.
**Outcome:** Repository is connected and ready to trigger scans on future pull requests.

### Steps

1. **[user]** Open Repository Connection Screen
   - Developer navigates to the repository setup area after logging into the Vulcan desktop app.
2. **[user]** Choose Git Provider
   - Developer selects GitHub or GitLab as the code hosting platform they want to connect.
3. **[system]** Redirect to Provider OAuth Page
   - Vulcan opens the provider's secure authorisation page so the developer can grant repository access.
4. **[user]** Authorise Vulcan on Provider
   - Developer signs into GitHub or GitLab and approves the requested read-only permissions for Vulcan.
5. **[system]** Receive and Store Access Token
   - Vulcan securely saves the OAuth token to access repositories on the developer's behalf.
6. **[system]** Fetch Available Repositories
   - Vulcan retrieves a list of repositories the developer owns or can access on the chosen provider.
7. **[user]** Select Repository to Connect
   - Developer picks one repository from the fetched list that they want Vulcan to monitor.
8. **[system]** Install Webhook on Repository
   - Vulcan registers a webhook on the selected repository to detect new and updated pull requests.
9. **[system]** Confirm Connection Success
   - Vulcan shows a confirmation that the repository is connected and scans will run on future pull requests.

