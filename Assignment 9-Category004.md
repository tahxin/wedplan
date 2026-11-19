***Assignment 9 \- Category: 004***

***Requirement Video: [B14-A9\_category-004.mp4](https://drive.google.com/file/d/1rH9YGRAy2IEW5NGbp3yjGyo5XzbWDCYC/view?usp=sharing)***

---

**Assignment 9-Category:004**

# **WedPlan \- Wedding Planning Platform**

## **Dear Candidates,**

We are pleased to inform you that you have successfully passed the first round of the selection process\!\! 

Your application and skills have impressed us, and we are excited to move forward with you in the next stages.

This project is designed to assess your skills, creativity, and problem-solving abilities. It will help us understand how you approach challenges and your ability to deliver high-quality solutions.

# **Project Name**

### **WedPlan — Wedding Planning Platform**

## **Project Overview and Discussion**

WedPlan is a wedding planning platform where customers can discover wedding-related services and request bookings from different vendors.

Vendors can create their profiles, publish wedding services, and manage customer booking requests. They can also upgrade to a Premium subscription to publish unlimited services and get additional promotional benefits.

Admins manage users, review published services, and monitor platform transactions.

The goal is to build a complete role-based web application using Next.js, TypeScript/JavaScript, ShadCN, Express.js, MongoDB, Better Auth, and Stripe.

### **How the System Works**

### **Customer**

* Browse Available Wedding Services  
* Search and Filter Services  
* View Service Details  
* Submit Booking Requests  
* Track Booking Request Status  
* Cancel Pending Booking Requests  
* Access Customer Dashboard

  ### **Vendor**

* Create and Manage Vendor Profile  
* Add, Update, and Delete Wedding Services  
* View and Manage Customer Booking Requests  
* Accept or Reject Booking Requests  
* Manage Subscription Plans  
* Access Vendor Dashboard

  ### **Admin**

* Manage Registered Users  
* Manage Vendors and Customers  
* Review and Manage Published Services  
* View Platform Transactions  
* Access Admin Dashboard

## **Technology Stack**

* Next.js  
* TypeScript/JavaScript  
* ShadCN/HeroUI  
* Express.js  
* MongoDB  
* Better Auth  
* Stripe Checkout  
* ImgBB (Image Hosting)  
* Framer Motion / Motion

## **Similar Platforms**

* [The Knot](https://www.theknot.com/)  
* [Zola](https://www.zola.com/)

# **Ensure the Following Things to Get 100% Mark**

* Minimum 20 meaningful client-side commits  
* Minimum 12 meaningful server-side commits  
* Commit messages must describe the actual work (no meaningless commits)  
* Separate GitHub repositories for client and server  
* Include a README file  
* Secure Better Auth configuration using environment variables  
* Secure MongoDB credentials using environment variables  
* Secure Stripe keys, Google OAuth credentials, and ImgBB API key using environment variables  
* Never push .env files or secret credentials to GitHub  
* Fully responsive design  
* Professional UI/UX  
* No copied projects  
* Proper error handling  
* Server-side role verification on all protected APIs  
* Premium access activated only after verified Stripe webhook events  
* No reload issues on production routes

# **README Requirements**

README.md must include:

* Project Name and Description  
* Important Features  
* Technology Stack  
* Installation Instructions  
* How to Run the Project Locally  
* Live Website Link  
* Client and Server Repository Links

## **Environment Variables**

Keep all sensitive information in environment variables.

Examples:

* MongoDB Connection String  
* Better Auth Secret and Configuration  
* Google OAuth Credentials  
* Stripe Secret Key and Webhook Secret  
* ImgBB API Key  
* Required Application URLs

# **Deployment Guideline**

* Live site should work perfectly.  
* No CORS Issues.  
* No 404 Issues.  
* No 504 Issues.  
* Reloading any route should not throw errors.  
* Private routes should work after page refresh.  
* Logged-in users should remain authenticated.  
* Stripe Checkout and webhook flow should work on the live site.  
* Admin credentials provided for evaluation should work on the live site.

# **Layout & Page Structure**

## **Navbar**

Logo / Name: **WedPlan**

### **Public Routes**

* Home  
* Browse Services  
* Sign In  
* Sign Up

  ### **Authenticated Routes**

* Home  
* Browse Services  
* User Profile Dropdown

  ### **Profile Dropdown**

* User Name and Profile Image  
* Dashboard  
* Profile Settings  
* Logout

Navbar content must update immediately after authentication state changes.

## **Footer**

Must contain:

* Logo and Short Description  
* Important Navigation Links  
* Contact Information  
* Social Media Links  
* Copyright Information

## **Main Pages**

### **Public**

* Home  
* Browse Services  
* Sign In  
* Sign Up

  ### **Private**

* Service Details (redirect to Sign In if unauthenticated)  
* Dashboard  
* Profile Settings  
* Payment Success  
* Payment Cancel

  ### **Vendor Dashboard**

* Overview  
* My Services  
* Add Service  
* Booking Requests  
* Subscription  
* Profile Settings

  ### **Customer Dashboard**

* Overview  
* My Bookings  
* Profile Settings

  ### **Admin Dashboard**

* Overview  
* Manage Users  
* Manage Services  
* Transactions

Users must not be able to access another role's dashboard by manually changing the URL.

# **Home Page**

## **Banner Section**

Include:

* Title (Clear Headline)  
* Short Description  
* CTA Button (Explore Wedding Services)  
* Wedding-Themed Background Image or Illustration

## **Dynamic Section 1**

### **Featured Wedding Services**

Show at least 6 services from the database. Display only approved and active services.

Card Data:

* Service Image  
* Service Name  
* Category  
* Price  
* Location  
* Vendor Information  
* View Details Button

## **Dynamic Section 2**

### **Wedding Service Categories**

Display service categories. Users should be able to explore services by category.

Categories:

* Photography & Videography  
* Wedding Venues  
* Decoration & Florist  
* Catering Services  
* Makeup & Styling  
* Wedding Fashion

## **Additional Sections**

Required:

* Why Choose WedPlan? (custom section highlighting the benefits of using the platform)

Create any one:

* How WedPlan Works  
* Popular Wedding Destinations  
* Customer Testimonials  
* Wedding Planning Tips

## **Animation Requirement**

Implement Framer Motion / Motion animations on suitable homepage sections. Animations should be smooth and should not negatively affect the user experience.

# **Browse Services Page**

Public page where customers can explore available wedding services. Users can browse services without logging in.

## **Service Listing**

Display approved and active services from the database in a responsive card layout.

Card Data:

* Service Image  
* Service Name  
* Category  
* Price  
* Location  
* Vendor Information  
* View Details Button

## **Search & Filter**

* Search Services by Name  
* Category-Based Filtering  
* Location-Based Filtering

## **States**

* Loading State  
* Empty State

## **Access Rule**

If an unauthenticated user clicks View Details or tries to book a service, redirect them to the Sign In page.

# **Service Details Page**

Dynamic route:

**/services/\[id\]**

Display:

* Service Name  
* Multiple Service Images  
* Category  
* Description  
* Price  
* Location  
* Vendor Information  
* Booking Option

Rules:

* Customers must be authenticated to submit booking requests  
* Vendors cannot book their own services  
* Admins cannot submit customer booking requests  
* Invalid service IDs should show an appropriate error message  
* Only approved and active services are available for booking

# **Authentication System**

Use Better Auth.

## **Sign Up**

Fields:

* Full Name  
* Email  
* Password  
* Profile Image (Optional \- upload as file using ImgBB)  
* Account Role

Role Selection:

* Vendor  
* Customer

Password Rules:

* Minimum 6 characters  
* One uppercase letter  
* One lowercase letter

Features:

* Email and Password Registration  
* Google Authentication  
* Success and Error Messages  
* Redirect to the appropriate page after registration

**Security Note:** Admin accounts must not be created through public registration. Admin access must be assigned securely.

## **Sign In**

Fields:

* Email  
* Password

Features:

* Credential Login  
* Google Login  
* Success and Error Messages

After Login:

* Redirect users according to their roles

## **Protected Routes**

* Protect all dashboard routes  
* Only Admin can access the Admin Dashboard  
* Only Vendors can access the Vendor Dashboard  
* Only Customers can access the Customer Dashboard  
* Unauthenticated users must be redirected to the Sign In page  
* Blocked users must not access protected platform features

Role verification must also be implemented on the server. Hiding dashboard links on the frontend is not sufficient.

# **Dashboard Structure**

Create a separate dashboard layout with a sidebar and main content area. Navigation must be based on the authenticated user's role.

# **Vendor Dashboard**

## **Dashboard Overview**

Show:

* Total Services  
* Active Services  
* Pending Booking Requests  
* Accepted Bookings  
* Current Subscription Plan

## **Add Service**

Fields:

* Service Name  
* Service Category  
* Description  
* Price  
* Location  
* Service Image (must be uploaded as file using ImgBB or another suitable image hosting service)

Rules:

* Vendors must be authenticated  
* Validate required fields  
* Vendors can see their submitted services and approval status

Store in:

**services Collection**

Default Status:

**Pending**

(until approved by an admin)

Free Plan Limitation:

* Free vendors can publish a maximum of 3 active services  
* Premium vendors can publish unlimited services

## **My Services**

Show all services created by the logged-in vendor.

Vendor can:

* View Service Information  
* Update Services  
* Delete Services  
* View Approval Status  
* Manage Service Availability

A rejected service must not be visible to customers.

## **Booking Requests**

Show booking requests for the vendor's services.

Show:

* Customer Information  
* Service Information  
* Event Date  
* Event Location  
* Customer Message  
* Booking Status

Actions:

* Accept  
* Reject

Rules:

* Only pending requests can be accepted or rejected  
* Once accepted or rejected, a request cannot be processed again  
* Vendors cannot modify booking requests belonging to other vendors

## **Subscription**

Show the available plans.

### **Free Plan**

* Maximum 3 Active Services  
* Basic Vendor Dashboard  
* Booking Request Management

  ### **Premium Plan**

* Unlimited Active Services  
* Premium Vendor Badge  
* All Free Plan Features

Provide an **Upgrade to Premium** button.

# **Customer Dashboard**

## **Dashboard Overview**

Show:

* Total Booking Requests  
* Pending Bookings  
* Accepted Bookings  
* Rejected Bookings

## **My Bookings**

Show all booking requests submitted by the logged-in customer.

Show:

* Service Name and Image  
* Vendor Information  
* Event Date  
* Event Location  
* Booking Status  
* Booking Request Date

Customer can:

* View Booking Details  
* Cancel Pending Booking Requests

Rules:

* Customers cannot modify or cancel another customer's bookings  
* Customers cannot cancel an already accepted, rejected, or cancelled booking

## **Profile Settings**

Update profile information. See Profile Management section.

# **Admin Dashboard**

## **Overview**

Show:

* Total Registered Users  
* Total Vendors  
* Total Customers  
* Total Services  
* Pending Services  
* Total Transactions

## **Manage Users**

Admin can:

* View All Registered Users  
* Search Users by Name or Email  
* Filter Users by Role  
* View User Details  
* Block User  
* Unblock User

Blocked users must not be able to access protected platform features.

## **Manage Services**

Admin can:

* View All Submitted Services  
* Search and Filter Services  
* Review Pending Services  
* Approve Services  
* Reject Services  
* Change Status of Published Services When Necessary  
* Delete Inappropriate Services

Only approved and active services should be visible on the public Browse Services page.

## **Transactions**

Show:

* Vendor Information  
* Subscription Plan  
* Payment Amount  
* Payment Status  
* Transaction Date

Admin must not be able to modify payment records manually to mark an unsuccessful payment as successful.

# **Booking Request System**

When a customer clicks the booking option on a service details page, show a booking form.

## **Booking Form**

Fields:

* Event Date  
* Event Location  
* Additional Message

Automatically identify:

* Customer  
* Selected Vendor

Store in:

**bookings Collection**

Default Status:

**Pending**

Booking Status Values:

* Pending  
* Accepted  
* Rejected  
* Cancelled

## **Rules**

* Prevent customers from booking their own services  
* Prevent duplicate active booking requests for the same service and event date  
* Show appropriate success and error messages  
* Vendor can review and manage the request from the Vendor Dashboard

# **Payment System**

Premium Vendor Feature

Vendors must upgrade to Premium before publishing more than 3 active services.

Use Stripe Checkout (Test Mode).

## **Payment Flow**

* Vendor clicks Upgrade to Premium  
* Backend creates a Stripe Checkout Session  
* Redirect the vendor to the Stripe Checkout page  
* On success, redirect to Payment Success page  
* On cancel, redirect to Payment Cancel page

## **Payment Success Page**

After successful payment:

* Show confirmation  
* Save transaction  
* Update vendor subscription status after verified payment confirmation

Store in:

**transactions Collection**

## **Payment Security**

* Do not trust the frontend payment success redirect to activate Premium access  
* Verify payment events using Stripe webhooks  
* Keep Stripe secret keys on the server  
* Do not expose sensitive payment information  
* Prevent unauthorized users from creating subscription sessions for other vendors  
* Handle subscription cancellation and expiration appropriately

# **Profile Management**

Both Vendors and Customers can update their profile information.

Update:

* Name  
* Profile Image  
* Other Editable Profile Information

Rules:

* Show appropriate success and error messages  
* Users must not be able to change their own role or subscription status through profile updates

# **JWT Authentication & Backend Security**

Implement JWT-based authentication and authorization for the Express.js backend.

* Generate or obtain an appropriate JWT for authenticated users  
* Store and transmit the token securely using the required client-side authentication flow  
* Create middleware to verify JWT tokens  
* Create role-based middleware for Admin, Vendor, and Customer  
* Protect private API routes  
* Verify resource ownership before allowing updates or deletions  
* Validate request data on the server  
* Never rely only on frontend role checks  
* Never trust user IDs or roles sent by the client without server-side verification  
* Return appropriate HTTP status codes for unauthorized (401) and forbidden (403) requests

# **Additional Requirements**

## **Loading State**

Show meaningful loader while:

* Fetching Services  
* Loading Dashboard Data  
* Submitting Forms  
* Processing Booking Requests  
* Processing Payments

## **Error Handling**

Implement proper error handling for:

* Invalid Routes  
* Failed API Requests  
* Invalid Form Submissions  
* Unauthorized Access  
* Missing Database Records  
* Failed Image Uploads

## **Notifications**

* Use toast notifications for successful and unsuccessful actions  
* Do not use browser alert() for normal application feedback

# **UI Design Requirements**

* Responsive on Desktop, Tablet, and Mobile  
* Professional Wedding-Themed Interface  
* Consistent Spacing, Typography, and Colors  
* Use ShadCN Components Appropriately  
* Reusable Components  
* Avoid Unnecessary Animations and Visual Clutter  
* All Buttons and Navigation Links Must Work Correctly

# **Dashboard UI Requirements**

* Sidebar Navigation  
* Main Content Area  
* Responsive Layout  
* Role-Based Navigation  
* Statistics Cards  
* Consistent Theme

# **Challenge Requirements**

1. **Search**

* Implement advanced service search

2. **Sorting**  
* Sort services by price  
* Support ascending and descending sorting

3. **JWT Verification**

* Implement proper JWT verification middleware on the Express backend  
* Protected routes must reject invalid or expired tokens

# **Database Architecture**

Use MongoDB. Better Auth manages its own authentication-related collections. Use the following three main business collections and proper references between collections. Do not create unnecessary collections for the same information.

## **users (Better Auth)** name email image role isBlocked businessName (vendor) subscriptionPlan subscriptionExpiresAt

## **Services** vendorId serviceName category description price location images status createdAt

## **Bookings** serviceId vendorId customerId eventDate eventLocation message status createdAt

## **Transactions** vendorId plan amount currency stripeSessionId stripeSubscriptionId status createdAt

# **Final Guidelines**

* Read the complete assignment requirements before starting  
* Plan your database structure before developing the APIs  
* Keep client and server code organized  
* Use meaningful Git commits throughout development  
* Test each feature before moving to the next one  
* Deploy the application before the deadline \- do not leave deployment until the last moment

## **Before Submitting**

* Test all major features  
* Verify all role-based permissions  
* Test booking requests from both customer and vendor accounts  
* Test Stripe Checkout using test credentials  
* Verify the application works after deployment  
* Ensure no sensitive environment variables are exposed

**Build WedPlan as a functional wedding planning platform, not just a collection of static pages.**

# **What To Submit**

* ### **Admin Email**

* ### **Admin Password**

* ### **Live Site Link**

* ### **Github Repository (Server)**

* ### **Github Repository (Client)**

* ### **Additional Instructions Required to Test the Application**