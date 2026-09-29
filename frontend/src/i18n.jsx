import {
    createContext,
    useContext,
    useState
} from "react";


// =====================================
// TRANSLATIONS
// =====================================

const translations = {

    // =========================
    // ENGLISH
    // =========================

    en: {
        appName: "EcoScrap",
        language: "Language",
        english: "English",
        hindi: "Hindi",
        marathi: "Marathi",

        logout: "Logout",
        welcome: "Welcome",
        dashboardDescription:
            "Connect households, collectors, organizations and recyclers.",

        // =========================
        // COMMON UI
        // =========================

        available: "AVAILABLE",
        verified: "VERIFIED",
        pending: "PENDING",
        completedStatus: "COMPLETED",
        accepted: "ACCEPTED",
        rejected: "REJECTED",
        open: "OPEN",
        closed: "CLOSED",
        live: "LIVE",
        active: "ACTIVE",
        loading: "Loading...",
        refresh: "Refresh",
        save: "Save",
        cancel: "Cancel",
        close: "Close",
        submit: "Submit",
        create: "Create",
        update: "Update",
        delete: "Delete",
        search: "Search",
        filter: "Filter",
        details: "Details",
        actions: "Actions",
        yes: "Yes",
        no: "No",
        noData: "No data available.",
        tryAgain: "Try again",
        viewDetails: "View Details",
        back: "Back",
        next: "Next",
        previous: "Previous",

        // =========================
        // DASHBOARD
        // =========================

        recyclingOperations: "Recycling Operations",
        digitalInventory: "Digital Inventory",
        yourImpact: "Your Impact",
        pickupService: "Pickup Service",
        pickupTracking: "Pickup Tracking",
        materialPricing: "Material Pricing",
        estimateValue: "Estimate Value",
        ecoscrapProcess: "EcoScrap Process",

        // =========================
        // Dashboard statistics
        // =========================

        pickups: "Pickups",
        completed: "Completed",
        recycledKg: "Recycled kg",
        amount: "Amount ₹",
        greenCredits: "Green Credits",

        // =========================
        // Environmental impact
        // =========================

        environmentalImpact: "Environmental Impact",
        wasteRecycled: "Waste Recycled",
        treeEquivalent: "Tree Equivalent",
        waterSaving: "Water Saving Estimate",
        environmentalMessage:
            "Every kilogram of waste recycled helps reduce landfill waste and supports a circular economy.",

        // =========================
        // Notifications
        // =========================

        notifications: "Notifications",
        hide: "Hide",
        view: "View",
        unreadNotifications: "unread notifications",
        noNotifications: "No notifications yet.",
        markAllAsRead: "Mark all as read",
        markRead: "Mark read",

        pickupAccepted:
            "Your pickup has been accepted by a collector.",
        collectorOnWay:
            "Your collector is on the way.",
        collectorArrived:
            "Your collector has arrived.",
        pickupCancelled:
            "Your pickup has been cancelled.",
        pickupCompleted:
            "Your pickup has been completed.",
        receiptReady:
            "collected and your digital receipt is ready.",

        // =========================
        // Pickup
        // =========================

        bookScrapPickup: "Book Scrap Pickup",
        pickupAddress: "Pickup Address",
        enterCompletePickupAddress:
            "Enter your complete pickup address",
        pickupTimeSlot: "Pickup Time Slot",
        selectTimeSlot: "Select time slot",
        addScrapItemButton: "Add Scrap Item",
        pickupItems: "Pickup Items",
        bookPickup: "Book Pickup",
        myPickupRequests: "My Pickup Requests",
        noPickupRequests: "No pickup requests yet.",
        address: "Address",
        slot: "Slot",
        actualWeight: "Actual Weight",
        actualWeightKg: "Actual Weight (kg)",
        finalAmount: "Final Amount",
        onTheWay: "On the Way",
        arrived: "Arrived",
        enterActualWeight: "Enter actual weight",
        completePickup: "Complete Pickup",

        // =========================
        // Pickup messages
        // =========================

        addAtLeastOneScrapItem:
            "Add at least one scrap item.",
        enterPickupAddress:
            "Please enter your pickup address.",
        selectPickupSlot:
            "Please select a pickup time slot.",
        gettingPickupLocation:
            "Getting your pickup location...",
        pickupLocationCaptured:
            "Pickup location captured.",
        locationPermissionUnavailable:
            "Location permission was not available. Pickup can still be booked, but it won't appear in Smart Route.",
        geolocationNotSupported:
            "Geolocation is not supported by this browser.",
        pickupBookedSuccessfully:
            "Pickup booked successfully! Estimated amount:",
        selectScrapValidWeight:
            "Please select scrap and enter a valid weight.",
        pickupAcceptedSuccessfully:
            "Pickup accepted successfully!",
        pickupStatusUpdatedTo:
            "Pickup status updated to",
        enterValidActualWeight:
            "Please enter a valid actual weight.",
        pickupCompletedSuccessfully:
            "Pickup completed successfully!",
        paymentConfirmedSuccessfully:
            "Payment confirmed successfully!",
        allowPopups:
            "Please allow popups for this website.",

        // =========================
        // Receipt / payment
        // =========================

        digitalReceipt: "Digital Receipt",
        receiptNo: "Receipt No",
        status: "Status",
        paymentStatus: "Payment Status",
        paid: "PAID",
        pending: "PENDING",
        confirmPayment: "Confirm Payment",
        viewFullReceipt: "View Full Receipt",
        thankYouRecycling:
            "Thank you for recycling with EcoScrap!",

        // =========================
        // Scrap / calculator
        // =========================

        scrap: "Scrap",
        scrapPriceList: "Scrap Price List",
        scrapPriceCalculator: "Scrap Price Calculator",
        selectScrap: "Select Scrap",
        selectMaterial: "Select material",
        weight: "Weight",
        weightKg: "Weight (kg)",
        enterWeight: "Enter weight",
        rate: "Rate",
        estimatedValue: "Estimated Value",

        // =========================
        // Recycler / marketplace
        // =========================

        availableLots: "Available Lots",
        availableDigitalLots: "Available Digital Scrap Lots",
        loadingLots: "Loading available scrap lots...",
        noDigitalLots:
            "No digital scrap lots are available right now.",
        indicativeValue: "Indicative Value",
        collector: "Collector",
        liveAuctions: "Live Auctions",
        auctionsWon: "Auctions Won",
        marketplace: "Recycler Marketplace",
        purchaseRequests: "Purchase Requests",
        myPurchaseRequests: "My Purchase Requests",
        traceability: "Waste Traceability",
        transactionHistory: "Transaction History",

        // =========================
        // Recycler requests
        // =========================

        recyclerRequests: "Recycler Requests",
        noDigitalScrapLotsCreated:
            "No digital scrap lots created yet.",
        requestStatus: "Request Status",
        recycler: "Recycler",
        verifiedRecycler: "Verified Recycler",
        recyclerNotVerified: "Recycler not verified",
        accept: "Accept",
        reject: "Reject",
        recyclerRequestAccepted:
            "Recycler request accepted.",
        recyclerRequestRejected:
            "Recycler request rejected.",

        // =========================
        // Flow
        // =========================

        recyclerFlow: "Recycler Flow",
        findScrapLot: "Find Scrap Lot",
        viewMaterial: "View Material",
        request: "Request",
        collectorAccepts: "Collector Accepts",
        handover: "Handover",
        transaction: "Transaction",
        ecoscrapFlow: "EcoScrap Flow",
        flowText:
            "Select Scrap → Enter Weight → Calculate Price → Book Pickup → Collector → Weighing → Payment → Recycler → Traceability",

        // =========================
        // Collector
        // =========================

        availablePickupRequests:
            "Available Pickup Requests",
        noAvailablePickupRequests:
            "No pickup requests available right now.",
        requested: "REQUESTED",
        acceptPickup: "Accept Pickup",
        smartRouteUpdated:
            "Pickup accepted successfully! Smart Route updated.",
        calculatePrice: "Calculate Price",
        enterWeightLabel: "Enter Weight",
        payment: "Payment",
        weighing: "Weighing",

        // =========================
        // Auction
        // =========================

        liveMarketplace: "LIVE MARKETPLACE",
        auction: "Auction",
        auctions: "Auctions",
        createLiveAuction: "Create Live Auction",
        myAuctions: "My Auctions",
        auctionTitle: "Auction Title",
        material: "Material",
        estimatedWeight: "Estimated Weight",
        startingBid: "Starting Bid",
        currentBid: "Current Bid",
        auctionEndTime: "Auction End Time",
        placeBid: "Place Bid",
        closeAuction: "Close Auction",
        auctionEnded: "Auction Ended",
        auctionLive: "Live Auction",
        bids: "Bids",
        winner: "Winner",

        // =========================
        // Marketplace
        // =========================

        createMarketplaceListing: "Create Marketplace Listing",
        quantity: "Quantity",
        price: "Price",
        pricePerKg: "Price / kg",
        seller: "Seller",
        requestPurchase: "Request Purchase",
        myListings: "My Listings",
        availableListings: "Available Listings",
        purchaseRequest: "Purchase Request",
        completePurchase: "Complete Purchase",

        // =========================
        // Waste traceability
        // =========================

        wasteJourney: "WASTE JOURNEY",
        wasteTraceabilityTitle: "Waste Traceability",
        traceabilityDetails:
            "Track the complete journey of your recyclable material.",
        handoverProof: "Handover Proof",
        gpsLocation: "GPS Location",
        photoProof: "Photo Proof",
        verifiedRecord: "Verified Record",

        // =========================
        // Recycling certificates
        // =========================

        verifiedRecycling: "VERIFIED RECYCLING",
        recyclingCertificates: "Recycling Certificates",
        generateCertificate: "Generate Certificate",
        viewCertificate: "View Certificate",
        printCertificate: "Print Certificate",
        certificateGenerated: "Certificate Generated",
        certificateNo: "Certificate No",

        // =========================
        // Analytics
        // =========================

        advancedAnalytics: "Advanced Analytics",
        analyticsOverview: "Analytics Overview",
        totalRevenue: "Total Revenue",
        totalWeight: "Total Weight",
        totalPickups: "Total Pickups",
        averageValue: "Average Value",
        materialBreakdown: "Material Breakdown",
        monthlyActivity: "Monthly Activity",
        environmentalSummary: "Environmental Summary",

        // =========================
        // Reviews
        // =========================

        review: "Review",
        reviews: "Reviews",
        rating: "Rating",
        comment: "Comment",
        writeReview: "Write a Review",
        submitReview: "Submit Review",
        reviewSubmitted: "Review submitted successfully.",
        alreadyReviewed: "This pickup has already been reviewed.",

        // =========================
        // Smart Route
        // =========================

        collectorLogistics: "COLLECTOR LOGISTICS",
        smartRouteOptimization: "Smart Route Optimization",
        refreshRoute: "Refresh Route",
        currentLocation: "Current Location",
        routeStops: "Route Stops",
        distance: "Distance",
        drivingTime: "Driving Time",
        handlingTime: "Handling Time",
        totalTime: "Total Time",
        navigate: "Navigate",
        routeUpdated: "Route updated successfully.",

        // =========================
        // Admin
        // =========================

        adminControlCenter: "ADMIN CONTROL CENTER",
        adminDashboard: "Admin Dashboard",
        sellerVerification: "Seller Verification",
        recyclerVerification: "Recycler Verification",
        totalUsers: "Total Users",
        verifiedUsers: "Verified Users",
        verify: "Verify",
        unverify: "Unverify",

        // =========================
        // Authentication
        // =========================

        welcomeBack: "WELCOME BACK",
        getStarted: "GET STARTED",
        phoneNumber: "Phone Number",
        password: "Password",
        name: "Name",
        role: "Role",
        login: "Login",
        register: "Register",
        createAccount: "Create Account",
        alreadyHaveAccount: "Already have an account?",
        dontHaveAccount: "Don't have an account?",
        switchToLogin: "Login",
        switchToRegister: "Create Account",

        // =========================
        // Transaction history
        // =========================

        transactions: "Transactions",
        receipt: "Receipt",
        transactionAmount: "Transaction Amount",
        transactionDate: "Transaction Date",
        transactionCompleted: "Transaction Completed",
    },


    // =========================
    // HINDI
    // =========================

    hi: {
        appName: "ईकोस्क्रैप",
        language: "भाषा",
        english: "अंग्रेज़ी",
        hindi: "हिन्दी",
        marathi: "मराठी",

        logout: "लॉगआउट",
        welcome: "स्वागत है",
        dashboardDescription:
            "घरों, कलेक्टरों, संगठनों और रीसाइक्लर्स को जोड़ें।",

        // Common UI
        available: "उपलब्ध",
        verified: "सत्यापित",
        pending: "लंबित",
        completedStatus: "पूर्ण",
        accepted: "स्वीकृत",
        rejected: "अस्वीकृत",
        open: "खुला",
        closed: "बंद",
        live: "लाइव",
        active: "सक्रिय",
        loading: "लोड हो रहा है...",
        refresh: "रिफ्रेश",
        save: "सहेजें",
        cancel: "रद्द करें",
        close: "बंद करें",
        submit: "जमा करें",
        create: "बनाएं",
        update: "अपडेट करें",
        delete: "हटाएं",
        search: "खोजें",
        filter: "फ़िल्टर",
        details: "विवरण",
        actions: "कार्य",
        yes: "हाँ",
        no: "नहीं",
        noData: "कोई डेटा उपलब्ध नहीं है।",
        tryAgain: "फिर से प्रयास करें",
        viewDetails: "विवरण देखें",
        back: "वापस",
        next: "अगला",
        previous: "पिछला",

        // Dashboard
        recyclingOperations: "रीसाइक्लिंग संचालन",
        digitalInventory: "डिजिटल इन्वेंटरी",
        yourImpact: "आपका प्रभाव",
        pickupService: "पिकअप सेवा",
        pickupTracking: "पिकअप ट्रैकिंग",
        materialPricing: "सामग्री मूल्य",
        estimateValue: "मूल्य का अनुमान",
        ecoscrapProcess: "EcoScrap प्रक्रिया",

        pickups: "पिकअप",
        completed: "पूर्ण",
        recycledKg: "रीसाइकिल किया गया किलो",
        amount: "राशि ₹",
        greenCredits: "ग्रीन क्रेडिट",

        environmentalImpact: "पर्यावरणीय प्रभाव",
        wasteRecycled: "रीसाइकिल किया गया कचरा",
        treeEquivalent: "पेड़ों के बराबर",
        waterSaving: "पानी बचत का अनुमान",
        environmentalMessage:
            "रीसाइकिल किया गया हर किलोग्राम कचरा लैंडफिल कचरे को कम करने और सर्कुलर इकोनॉमी को बढ़ावा देने में मदद करता है।",

        notifications: "सूचनाएं",
        hide: "छुपाएं",
        view: "देखें",
        unreadNotifications: "अपठित सूचनाएं",
        noNotifications: "अभी कोई सूचना नहीं है।",
        markAllAsRead: "सभी को पढ़ा हुआ चिह्नित करें",
        markRead: "पढ़ा हुआ चिह्नित करें",

        pickupAccepted:
            "आपका पिकअप एक कलेक्टर द्वारा स्वीकार कर लिया गया है।",
        collectorOnWay:
            "आपका कलेक्टर रास्ते में है।",
        collectorArrived:
            "आपका कलेक्टर पहुंच गया है।",
        pickupCancelled:
            "आपका पिकअप रद्द कर दिया गया है।",
        pickupCompleted:
            "आपका पिकअप पूरा हो गया है।",
        receiptReady:
            "कचरा एकत्र किया गया और आपकी डिजिटल रसीद तैयार है।",

        bookScrapPickup: "स्क्रैप पिकअप बुक करें",
        pickupAddress: "पिकअप का पता",
        enterCompletePickupAddress:
            "अपना पूरा पिकअप पता दर्ज करें",
        pickupTimeSlot: "पिकअप का समय",
        selectTimeSlot: "समय चुनें",
        addScrapItemButton: "स्क्रैप आइटम जोड़ें",
        pickupItems: "पिकअप आइटम",
        bookPickup: "पिकअप बुक करें",
        myPickupRequests: "मेरे पिकअप अनुरोध",
        noPickupRequests: "अभी कोई पिकअप अनुरोध नहीं है।",
        address: "पता",
        slot: "समय स्लॉट",
        actualWeight: "वास्तविक वजन",
        actualWeightKg: "वास्तविक वजन (किग्रा)",
        finalAmount: "अंतिम राशि",
        onTheWay: "रास्ते में",
        arrived: "पहुंच गया",
        enterActualWeight: "वास्तविक वजन दर्ज करें",
        completePickup: "पिकअप पूरा करें",

        addAtLeastOneScrapItem:
            "कम से कम एक स्क्रैप आइटम जोड़ें।",
        enterPickupAddress:
            "कृपया अपना पिकअप पता दर्ज करें।",
        selectPickupSlot:
            "कृपया पिकअप का समय चुनें।",
        gettingPickupLocation:
            "आपका पिकअप स्थान प्राप्त किया जा रहा है...",
        pickupLocationCaptured:
            "पिकअप स्थान प्राप्त हो गया है।",
        locationPermissionUnavailable:
            "स्थान की अनुमति उपलब्ध नहीं थी। पिकअप फिर भी बुक किया जा सकता है, लेकिन यह Smart Route में दिखाई नहीं देगा।",
        geolocationNotSupported:
            "इस ब्राउज़र में जियोलोकेशन समर्थित नहीं है।",
        pickupBookedSuccessfully:
            "पिकअप सफलतापूर्वक बुक हो गया! अनुमानित राशि:",
        selectScrapValidWeight:
            "कृपया स्क्रैप चुनें और सही वजन दर्ज करें।",
        pickupAcceptedSuccessfully:
            "पिकअप सफलतापूर्वक स्वीकार किया गया!",
        pickupStatusUpdatedTo:
            "पिकअप की स्थिति अपडेट की गई:",
        enterValidActualWeight:
            "कृपया सही वास्तविक वजन दर्ज करें।",
        pickupCompletedSuccessfully:
            "पिकअप सफलतापूर्वक पूरा हुआ!",
        paymentConfirmedSuccessfully:
            "भुगतान सफलतापूर्वक पुष्टि किया गया!",
        allowPopups:
            "कृपया इस वेबसाइट के लिए पॉपअप की अनुमति दें।",

        digitalReceipt: "डिजिटल रसीद",
        receiptNo: "रसीद संख्या",
        status: "स्थिति",
        paymentStatus: "भुगतान स्थिति",
        paid: "भुगतान किया गया",
        pending: "लंबित",
        confirmPayment: "भुगतान की पुष्टि करें",
        viewFullReceipt: "पूरी रसीद देखें",
        thankYouRecycling:
            "EcoScrap के साथ रीसाइक्लिंग करने के लिए धन्यवाद!",

        scrap: "स्क्रैप",
        scrapPriceList: "स्क्रैप मूल्य सूची",
        scrapPriceCalculator: "स्क्रैप मूल्य कैलकुलेटर",
        selectScrap: "स्क्रैप चुनें",
        selectMaterial: "सामग्री चुनें",
        weight: "वजन",
        weightKg: "वजन (किग्रा)",
        enterWeight: "वजन दर्ज करें",
        rate: "दर",
        estimatedValue: "अनुमानित मूल्य",

        availableLots: "उपलब्ध लॉट",
        availableDigitalLots: "उपलब्ध डिजिटल स्क्रैप लॉट",
        loadingLots: "उपलब्ध स्क्रैप लॉट लोड हो रहे हैं...",
        noDigitalLots:
            "अभी कोई डिजिटल स्क्रैप लॉट उपलब्ध नहीं है।",
        indicativeValue: "अनुमानित मूल्य",
        collector: "कलेक्टर",
        liveAuctions: "लाइव नीलामी",
        auctionsWon: "जीती गई नीलामी",
        marketplace: "रीसाइक्लर मार्केटप्लेस",
        purchaseRequests: "खरीद अनुरोध",
        myPurchaseRequests: "मेरे खरीद अनुरोध",
        traceability: "कचरा ट्रेसबिलिटी",
        transactionHistory: "लेन-देन इतिहास",

        recyclerRequests: "रीसाइक्लर अनुरोध",
        noDigitalScrapLotsCreated:
            "अभी कोई डिजिटल स्क्रैप लॉट नहीं बनाया गया है।",
        requestStatus: "अनुरोध स्थिति",
        recycler: "रीसाइक्लर",
        verifiedRecycler: "सत्यापित रीसाइक्लर",
        recyclerNotVerified: "रीसाइक्लर सत्यापित नहीं है",
        accept: "स्वीकार करें",
        reject: "अस्वीकार करें",
        recyclerRequestAccepted:
            "रीसाइक्लर अनुरोध स्वीकार किया गया।",
        recyclerRequestRejected:
            "रीसाइक्लर अनुरोध अस्वीकार किया गया।",

        recyclerFlow: "रीसाइक्लर प्रक्रिया",
        findScrapLot: "स्क्रैप लॉट खोजें",
        viewMaterial: "सामग्री देखें",
        request: "अनुरोध",
        collectorAccepts: "कलेक्टर स्वीकार करता है",
        handover: "हस्तांतरण",
        transaction: "लेन-देन",
        ecoscrapFlow: "EcoScrap प्रक्रिया",
        flowText:
            "स्क्रैप चुनें → वजन दर्ज करें → मूल्य की गणना करें → पिकअप बुक करें → कलेक्टर → वजन → भुगतान → रीसाइक्लर → ट्रेसबिलिटी",

        availablePickupRequests:
            "उपलब्ध पिकअप अनुरोध",
        noAvailablePickupRequests:
            "अभी कोई पिकअप अनुरोध उपलब्ध नहीं है।",
        requested: "अनुरोधित",
        acceptPickup: "पिकअप स्वीकार करें",
        smartRouteUpdated:
            "पिकअप सफलतापूर्वक स्वीकार किया गया! Smart Route अपडेट हो गया।",
        calculatePrice: "मूल्य की गणना करें",
        enterWeightLabel: "वजन दर्ज करें",
        payment: "भुगतान",
        weighing: "वजन करना",

        liveMarketplace: "लाइव मार्केटप्लेस",
        auction: "नीलामी",
        auctions: "नीलामियां",
        createLiveAuction: "लाइव नीलामी बनाएं",
        myAuctions: "मेरी नीलामियां",
        auctionTitle: "नीलामी शीर्षक",
        material: "सामग्री",
        estimatedWeight: "अनुमानित वजन",
        startingBid: "शुरुआती बोली",
        currentBid: "वर्तमान बोली",
        auctionEndTime: "नीलामी समाप्ति समय",
        placeBid: "बोली लगाएं",
        closeAuction: "नीलामी बंद करें",
        auctionEnded: "नीलामी समाप्त",
        auctionLive: "लाइव नीलामी",
        bids: "बोलियां",
        winner: "विजेता",

        createMarketplaceListing: "मार्केटप्लेस लिस्टिंग बनाएं",
        quantity: "मात्रा",
        price: "कीमत",
        pricePerKg: "कीमत / किलो",
        seller: "विक्रेता",
        requestPurchase: "खरीद अनुरोध भेजें",
        myListings: "मेरी लिस्टिंग",
        availableListings: "उपलब्ध लिस्टिंग",
        purchaseRequest: "खरीद अनुरोध",
        completePurchase: "खरीद पूरी करें",

        wasteJourney: "कचरा यात्रा",
        wasteTraceabilityTitle: "कचरा ट्रेसबिलिटी",
        traceabilityDetails:
            "अपनी रीसाइक्लेबल सामग्री की पूरी यात्रा को ट्रैक करें।",
        handoverProof: "हस्तांतरण प्रमाण",
        gpsLocation: "GPS स्थान",
        photoProof: "फोटो प्रमाण",
        verifiedRecord: "सत्यापित रिकॉर्ड",

        verifiedRecycling: "सत्यापित रीसाइक्लिंग",
        recyclingCertificates: "रीसाइक्लिंग प्रमाणपत्र",
        generateCertificate: "प्रमाणपत्र बनाएं",
        viewCertificate: "प्रमाणपत्र देखें",
        printCertificate: "प्रमाणपत्र प्रिंट करें",
        certificateGenerated: "प्रमाणपत्र तैयार है",
        certificateNo: "प्रमाणपत्र संख्या",

        advancedAnalytics: "उन्नत विश्लेषण",
        analyticsOverview: "विश्लेषण अवलोकन",
        totalRevenue: "कुल राजस्व",
        totalWeight: "कुल वजन",
        totalPickups: "कुल पिकअप",
        averageValue: "औसत मूल्य",
        materialBreakdown: "सामग्री विवरण",
        monthlyActivity: "मासिक गतिविधि",
        environmentalSummary: "पर्यावरणीय सारांश",

        review: "समीक्षा",
        reviews: "समीक्षाएं",
        rating: "रेटिंग",
        comment: "टिप्पणी",
        writeReview: "समीक्षा लिखें",
        submitReview: "समीक्षा जमा करें",
        reviewSubmitted: "समीक्षा सफलतापूर्वक जमा की गई।",
        alreadyReviewed: "इस पिकअप की समीक्षा पहले ही की जा चुकी है।",

        collectorLogistics: "कलेक्टर लॉजिस्टिक्स",
        smartRouteOptimization: "Smart Route Optimization",
        refreshRoute: "रूट रिफ्रेश करें",
        currentLocation: "वर्तमान स्थान",
        routeStops: "रूट स्टॉप",
        distance: "दूरी",
        drivingTime: "ड्राइविंग समय",
        handlingTime: "हैंडलिंग समय",
        totalTime: "कुल समय",
        navigate: "नेविगेट करें",
        routeUpdated: "रूट सफलतापूर्वक अपडेट हुआ।",

        adminControlCenter: "एडमिन कंट्रोल सेंटर",
        adminDashboard: "एडमिन डैशबोर्ड",
        sellerVerification: "विक्रेता सत्यापन",
        recyclerVerification: "रीसाइक्लर सत्यापन",
        totalUsers: "कुल उपयोगकर्ता",
        verifiedUsers: "सत्यापित उपयोगकर्ता",
        verify: "सत्यापित करें",
        unverify: "सत्यापन हटाएं",

        welcomeBack: "वापसी पर स्वागत है",
        getStarted: "शुरू करें",
        phoneNumber: "फोन नंबर",
        password: "पासवर्ड",
        name: "नाम",
        role: "भूमिका",
        login: "लॉगिन",
        register: "रजिस्टर",
        createAccount: "खाता बनाएं",
        alreadyHaveAccount: "क्या आपके पास पहले से खाता है?",
        dontHaveAccount: "क्या आपका खाता नहीं है?",
        switchToLogin: "लॉगिन करें",
        switchToRegister: "खाता बनाएं",

        transactions: "लेन-देन",
        receipt: "रसीद",
        transactionAmount: "लेन-देन राशि",
        transactionDate: "लेन-देन की तारीख",
        transactionCompleted: "लेन-देन पूरा हुआ",
    },


    // =========================
    // MARATHI
    // =========================

    mr: {
        appName: "इकोस्क्रॅप",
        language: "भाषा",
        english: "इंग्रजी",
        hindi: "हिंदी",
        marathi: "मराठी",

        logout: "लॉगआउट",
        welcome: "स्वागत आहे",
        dashboardDescription:
            "घरे, कलेक्टर, संस्था आणि रीसायक्लर यांना जोडते.",

        available: "उपलब्ध",
        verified: "सत्यापित",
        pending: "प्रलंबित",
        completedStatus: "पूर्ण",
        accepted: "स्वीकारले",
        rejected: "नाकारले",
        open: "उघडे",
        closed: "बंद",
        live: "लाइव्ह",
        active: "सक्रिय",
        loading: "लोड होत आहे...",
        refresh: "रिफ्रेश",
        save: "जतन करा",
        cancel: "रद्द करा",
        close: "बंद करा",
        submit: "सबमिट करा",
        create: "तयार करा",
        update: "अपडेट करा",
        delete: "हटवा",
        search: "शोधा",
        filter: "फिल्टर",
        details: "तपशील",
        actions: "कृती",
        yes: "होय",
        no: "नाही",
        noData: "डेटा उपलब्ध नाही.",
        tryAgain: "पुन्हा प्रयत्न करा",
        viewDetails: "तपशील पहा",
        back: "मागे",
        next: "पुढे",
        previous: "मागील",

        recyclingOperations: "रीसायकलिंग ऑपरेशन्स",
        digitalInventory: "डिजिटल इन्व्हेंटरी",
        yourImpact: "तुमचा प्रभाव",
        pickupService: "पिकअप सेवा",
        pickupTracking: "पिकअप ट्रॅकिंग",
        materialPricing: "साहित्य किंमत",
        estimateValue: "मूल्याचा अंदाज",
        ecoscrapProcess: "EcoScrap प्रक्रिया",

        pickups: "पिकअप",
        completed: "पूर्ण",
        recycledKg: "पुनर्वापर केलेले किलो",
        amount: "रक्कम ₹",
        greenCredits: "ग्रीन क्रेडिट",

        environmentalImpact: "पर्यावरणीय परिणाम",
        wasteRecycled: "पुनर्वापर केलेला कचरा",
        treeEquivalent: "झाडांच्या समतुल्य",
        waterSaving: "पाणी बचतीचा अंदाज",
        environmentalMessage:
            "पुनर्वापर केलेला प्रत्येक किलो कचरा लँडफिल कचरा कमी करण्यास आणि सर्क्युलर इकॉनॉमीला मदत करतो.",

        notifications: "सूचना",
        hide: "लपवा",
        view: "पहा",
        unreadNotifications: "न वाचलेल्या सूचना",
        noNotifications: "सध्या कोणतीही सूचना नाही.",
        markAllAsRead: "सर्व वाचलेले म्हणून चिन्हांकित करा",
        markRead: "वाचलेले म्हणून चिन्हांकित करा",

        pickupAccepted:
            "तुमची पिकअप विनंती कलेक्टरने स्वीकारली आहे.",
        collectorOnWay:
            "तुमचा कलेक्टर मार्गावर आहे.",
        collectorArrived:
            "तुमचा कलेक्टर पोहोचला आहे.",
        pickupCancelled:
            "तुमची पिकअप विनंती रद्द करण्यात आली आहे.",
        pickupCompleted:
            "तुमची पिकअप पूर्ण झाली आहे.",
        receiptReady:
            "कचरा गोळा करण्यात आला असून तुमची डिजिटल पावती तयार आहे.",

        bookScrapPickup: "भंगार पिकअप बुक करा",
        pickupAddress: "पिकअपचा पत्ता",
        enterCompletePickupAddress:
            "तुमचा पूर्ण पिकअप पत्ता प्रविष्ट करा",
        pickupTimeSlot: "पिकअपची वेळ",
        selectTimeSlot: "वेळ निवडा",
        addScrapItemButton: "भंगार वस्तू जोडा",
        pickupItems: "पिकअप वस्तू",
        bookPickup: "पिकअप बुक करा",
        myPickupRequests: "माझ्या पिकअप विनंत्या",
        noPickupRequests: "सध्या कोणतीही पिकअप विनंती नाही.",
        address: "पत्ता",
        slot: "वेळ स्लॉट",
        actualWeight: "वास्तविक वजन",
        actualWeightKg: "वास्तविक वजन (किलो)",
        finalAmount: "अंतिम रक्कम",
        onTheWay: "मार्गावर",
        arrived: "पोहोचला",
        enterActualWeight: "वास्तविक वजन प्रविष्ट करा",
        completePickup: "पिकअप पूर्ण करा",

        addAtLeastOneScrapItem:
            "किमान एक भंगार वस्तू जोडा.",
        enterPickupAddress:
            "कृपया तुमचा पिकअप पत्ता प्रविष्ट करा.",
        selectPickupSlot:
            "कृपया पिकअपची वेळ निवडा.",
        gettingPickupLocation:
            "तुमचे पिकअप स्थान मिळवत आहे...",
        pickupLocationCaptured:
            "पिकअप स्थान मिळाले आहे.",
        locationPermissionUnavailable:
            "स्थानाची परवानगी उपलब्ध नव्हती. पिकअप बुक करता येईल, परंतु ते Smart Route मध्ये दिसणार नाही.",
        geolocationNotSupported:
            "या ब्राउझरमध्ये जिओलोकेशन समर्थित नाही.",
        pickupBookedSuccessfully:
            "पिकअप यशस्वीरित्या बुक झाले! अंदाजे रक्कम:",
        selectScrapValidWeight:
            "कृपया भंगार निवडा आणि योग्य वजन प्रविष्ट करा.",
        pickupAcceptedSuccessfully:
            "पिकअप यशस्वीरित्या स्वीकारले!",
        pickupStatusUpdatedTo:
            "पिकअपची स्थिती अपडेट केली:",
        enterValidActualWeight:
            "कृपया योग्य वास्तविक वजन प्रविष्ट करा.",
        pickupCompletedSuccessfully:
            "पिकअप यशस्वीरित्या पूर्ण झाले!",
        paymentConfirmedSuccessfully:
            "पेमेंटची यशस्वीरित्या पुष्टी झाली!",
        allowPopups:
            "कृपया या वेबसाइटसाठी पॉपअपला परवानगी द्या.",

        digitalReceipt: "डिजिटल पावती",
        receiptNo: "पावती क्रमांक",
        status: "स्थिती",
        paymentStatus: "पेमेंट स्थिती",
        paid: "पेड",
        pending: "प्रलंबित",
        confirmPayment: "पेमेंटची पुष्टी करा",
        viewFullReceipt: "पूर्ण पावती पहा",
        thankYouRecycling:
            "EcoScrap सोबत पुनर्वापर केल्याबद्दल धन्यवाद!",

        scrap: "भंगार",
        scrapPriceList: "भंगार किंमत यादी",
        scrapPriceCalculator: "भंगार किंमत कॅल्क्युलेटर",
        selectScrap: "भंगार निवडा",
        selectMaterial: "साहित्य निवडा",
        weight: "वजन",
        weightKg: "वजन (किलो)",
        enterWeight: "वजन प्रविष्ट करा",
        rate: "दर",
        estimatedValue: "अंदाजे मूल्य",

        availableLots: "उपलब्ध लॉट",
        availableDigitalLots: "उपलब्ध डिजिटल भंगार लॉट",
        loadingLots: "उपलब्ध भंगार लॉट लोड होत आहेत...",
        noDigitalLots:
            "सध्या कोणतेही डिजिटल भंगार लॉट उपलब्ध नाहीत.",
        indicativeValue: "अंदाजे मूल्य",
        collector: "कलेक्टर",
        liveAuctions: "लाइव्ह लिलाव",
        auctionsWon: "जिंकलेले लिलाव",
        marketplace: "रीसायक्लर मार्केटप्लेस",
        purchaseRequests: "खरेदी विनंत्या",
        myPurchaseRequests: "माझ्या खरेदी विनंत्या",
        traceability: "कचरा ट्रेसबिलिटी",
        transactionHistory: "व्यवहार इतिहास",

        recyclerRequests: "रीसायक्लर विनंत्या",
        noDigitalScrapLotsCreated:
            "अद्याप कोणतेही डिजिटल भंगार लॉट तयार केलेले नाही.",
        requestStatus: "विनंती स्थिती",
        recycler: "रीसायक्लर",
        verifiedRecycler: "सत्यापित रीसायक्लर",
        recyclerNotVerified: "रीसायक्लर सत्यापित नाही",
        accept: "स्वीकारा",
        reject: "नकार द्या",
        recyclerRequestAccepted:
            "रीसायक्लर विनंती स्वीकारली.",
        recyclerRequestRejected:
            "रीसायक्लर विनंती नाकारली.",

        recyclerFlow: "रीसायक्लर प्रक्रिया",
        findScrapLot: "भंगार लॉट शोधा",
        viewMaterial: "साहित्य पहा",
        request: "विनंती",
        collectorAccepts: "कलेक्टर स्वीकारतो",
        handover: "हस्तांतरण",
        transaction: "व्यवहार",
        ecoscrapFlow: "EcoScrap प्रक्रिया",
        flowText:
            "भंगार निवडा → वजन प्रविष्ट करा → किंमत मोजा → पिकअप बुक करा → कलेक्टर → वजन → पेमेंट → रीसायक्लर → ट्रेसबिलिटी",

        availablePickupRequests:
            "उपलब्ध पिकअप विनंत्या",
        noAvailablePickupRequests:
            "सध्या कोणत्याही पिकअप विनंत्या उपलब्ध नाहीत.",
        requested: "विनंती केलेली",
        acceptPickup: "पिकअप स्वीकारा",
        smartRouteUpdated:
            "पिकअप यशस्वीरित्या स्वीकारले! Smart Route अपडेट झाला.",
        calculatePrice: "किंमत मोजा",
        enterWeightLabel: "वजन प्रविष्ट करा",
        payment: "पेमेंट",
        weighing: "वजन करणे",

        liveMarketplace: "लाइव्ह मार्केटप्लेस",
        auction: "लिलाव",
        auctions: "लिलाव",
        createLiveAuction: "लाइव्ह लिलाव तयार करा",
        myAuctions: "माझे लिलाव",
        auctionTitle: "लिलावाचे शीर्षक",
        material: "साहित्य",
        estimatedWeight: "अंदाजे वजन",
        startingBid: "सुरुवातीची बोली",
        currentBid: "सध्याची बोली",
        auctionEndTime: "लिलाव समाप्तीची वेळ",
        placeBid: "बोली लावा",
        closeAuction: "लिलाव बंद करा",
        auctionEnded: "लिलाव संपला",
        auctionLive: "लाइव्ह लिलाव",
        bids: "बोल्या",
        winner: "विजेता",

        createMarketplaceListing: "मार्केटप्लेस लिस्टिंग तयार करा",
        quantity: "प्रमाण",
        price: "किंमत",
        pricePerKg: "किंमत / किलो",
        seller: "विक्रेता",
        requestPurchase: "खरेदी विनंती पाठवा",
        myListings: "माझ्या लिस्टिंग",
        availableListings: "उपलब्ध लिस्टिंग",
        purchaseRequest: "खरेदी विनंती",
        completePurchase: "खरेदी पूर्ण करा",

        wasteJourney: "कचऱ्याचा प्रवास",
        wasteTraceabilityTitle: "कचरा ट्रेसबिलिटी",
        traceabilityDetails:
            "तुमच्या पुनर्वापरयोग्य सामग्रीचा संपूर्ण प्रवास ट्रॅक करा.",
        handoverProof: "हस्तांतरण पुरावा",
        gpsLocation: "GPS स्थान",
        photoProof: "फोटो पुरावा",
        verifiedRecord: "सत्यापित रेकॉर्ड",

        verifiedRecycling: "सत्यापित पुनर्वापर",
        recyclingCertificates: "रीसायक्लिंग प्रमाणपत्रे",
        generateCertificate: "प्रमाणपत्र तयार करा",
        viewCertificate: "प्रमाणपत्र पहा",
        printCertificate: "प्रमाणपत्र प्रिंट करा",
        certificateGenerated: "प्रमाणपत्र तयार झाले",
        certificateNo: "प्रमाणपत्र क्रमांक",

        advancedAnalytics: "प्रगत विश्लेषण",
        analyticsOverview: "विश्लेषण आढावा",
        totalRevenue: "एकूण महसूल",
        totalWeight: "एकूण वजन",
        totalPickups: "एकूण पिकअप",
        averageValue: "सरासरी मूल्य",
        materialBreakdown: "साहित्य तपशील",
        monthlyActivity: "मासिक क्रियाकलाप",
        environmentalSummary: "पर्यावरणीय सारांश",

        review: "पुनरावलोकन",
        reviews: "पुनरावलोकने",
        rating: "रेटिंग",
        comment: "टिप्पणी",
        writeReview: "पुनरावलोकन लिहा",
        submitReview: "पुनरावलोकन सबमिट करा",
        reviewSubmitted: "पुनरावलोकन यशस्वीरित्या सबमिट केले.",
        alreadyReviewed: "या पिकअपचे पुनरावलोकन आधीच केले आहे.",

        collectorLogistics: "कलेक्टर लॉजिस्टिक्स",
        smartRouteOptimization: "Smart Route Optimization",
        refreshRoute: "रूट रिफ्रेश करा",
        currentLocation: "सध्याचे स्थान",
        routeStops: "रूट स्टॉप",
        distance: "अंतर",
        drivingTime: "ड्रायव्हिंग वेळ",
        handlingTime: "हँडलिंग वेळ",
        totalTime: "एकूण वेळ",
        navigate: "नेव्हिगेट करा",
        routeUpdated: "रूट यशस्वीरित्या अपडेट झाला.",

        adminControlCenter: "अॅडमिन कंट्रोल सेंटर",
        adminDashboard: "अॅडमिन डॅशबोर्ड",
        sellerVerification: "विक्रेता सत्यापन",
        recyclerVerification: "रीसायक्लर सत्यापन",
        totalUsers: "एकूण वापरकर्ते",
        verifiedUsers: "सत्यापित वापरकर्ते",
        verify: "सत्यापित करा",
        unverify: "सत्यापन काढा",

        welcomeBack: "पुन्हा स्वागत आहे",
        getStarted: "सुरुवात करा",
        phoneNumber: "फोन नंबर",
        password: "पासवर्ड",
        name: "नाव",
        role: "भूमिका",
        login: "लॉगिन",
        register: "नोंदणी",
        createAccount: "खाते तयार करा",
        alreadyHaveAccount: "तुमचे आधीच खाते आहे?",
        dontHaveAccount: "तुमचे खाते नाही?",
        switchToLogin: "लॉगिन करा",
        switchToRegister: "खाते तयार करा",

        transactions: "व्यवहार",
        receipt: "पावती",
        transactionAmount: "व्यवहार रक्कम",
        transactionDate: "व्यवहार तारीख",
        transactionCompleted: "व्यवहार पूर्ण झाला",
    },
};


// =====================================
// LANGUAGE CONTEXT
// =====================================

const LanguageContext = createContext(null);


// =====================================
// GET CURRENT LANGUAGE
// =====================================

export function getLanguage() {
    const savedLanguage =
        localStorage.getItem("ecoscrap-language");

    if (
        savedLanguage === "en" ||
        savedLanguage === "hi" ||
        savedLanguage === "mr"
    ) {
        return savedLanguage;
    }

    return "en";
}


// =====================================
// LANGUAGE PROVIDER
// =====================================

export function LanguageProvider({ children }) {
    const [language, setLanguageState] =
        useState(getLanguage());

    const changeLanguage = (newLanguage) => {
        if (
            newLanguage !== "en" &&
            newLanguage !== "hi" &&
            newLanguage !== "mr"
        ) {
            return;
        }

        localStorage.setItem(
            "ecoscrap-language",
            newLanguage
        );

        setLanguageState(newLanguage);
    };

    const t = (key) => {
        return (
            translations[language]?.[key] ||
            translations.en[key] ||
            key
        );
    };

    return (
        <LanguageContext.Provider
            value={{
                language,
                changeLanguage,
                t,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}


// =====================================
// USE LANGUAGE HOOK
// =====================================

export function useLanguage() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error(
            "useLanguage must be used inside LanguageProvider"
        );
    }

    return context;
}


// =====================================
// SIMPLE TRANSLATION FUNCTION
// =====================================

export function t(key) {
    const language = getLanguage();

    return (
        translations[language]?.[key] ||
        translations.en[key] ||
        key
    );
}


// =====================================
// EXPORT TRANSLATIONS
// =====================================

export { translations };