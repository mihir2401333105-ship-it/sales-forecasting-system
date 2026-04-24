import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.forecasting': 'Forecasting Hub',
    'nav.data': 'Data Ingestion',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.search': 'Search forecasts, products, or reports...',
    
    // Dashboard
    'dash.welcome': 'Welcome',
    'dash.title': 'Executive Summary',
    'dash.subtitle': 'Real-time performance metrics and AI-powered projections.',
    'dash.historical_sales': 'Total Historical Sales',
    'dash.predicted_sales': 'Total Predicted Sales',
    'dash.avg_monthly': 'Avg Monthly Sales',
    'dash.accuracy': 'Model Accuracy',
    'dash.revenue_forecast': 'Revenue Forecast',
    'dash.historical': 'Historical',
    'dash.predicted': 'Predicted',
    'dash.insight': 'Forecast Insight',
    'dash.open_hub': 'Open Forecasting Hub',
    'dash.no_data': 'No data loaded yet',
    'dash.upload_data': 'Upload Data',
    'dash.change_dataset': 'Change Dataset',

    // Settings
    'settings.title': 'Platform Settings',
    'settings.subtitle': 'Manage your personal profile, organization boundaries, and security parameters.',
    'settings.profile': 'Profile',
    'settings.preferences': 'Preferences',
    'settings.personal_info': 'Personal Information',
    'settings.personal_subtitle': 'Update your photo and personal details.',
    'settings.save_changes': 'Save Changes',
    'settings.first_name': 'First Name',
    'settings.last_name': 'Last Name',
    'settings.email': 'Email Address',
    'settings.job_title': 'Job Title',
    'settings.regional': 'Regional Settings',
    'settings.language': 'Language Selection',
    'settings.date_format': 'Date Format',
    'settings.visual': 'Visual Settings',
    'settings.light_mode': 'Light Mode',
    'settings.dark_mode': 'Dark Mode',
    
    // Auth
    'auth.login_title': 'Welcome back',
    'auth.login_subtitle': 'Enter your credentials to access your dashboard',
    'auth.signup_title': 'Create an account',
    'auth.signup_subtitle': 'Join thousands of sales teams worldwide',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.sign_in': 'Sign in',
    'auth.sign_up': 'Sign up',
    'auth.no_account': "Don't have an account?",
    'auth.have_account': 'Already have an account?',
  },
  mr: {
    // मराठी (Marathi)
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.forecasting': 'फोरकास्टिंग हब',
    'nav.data': 'डेटा संकलन',
    'nav.reports': 'अहवाल',
    'nav.settings': 'सेटिंग्ज',
    'nav.logout': 'लॉगआउट',
    'nav.search': 'शोध...',
    
    'dash.welcome': 'स्वागत आहे',
    'dash.title': 'कार्यकारी सारांश',
    'dash.subtitle': 'रिअल-टाइम कामगिरी मेट्रिक्स आणि एआय-आधारित अंदाज.',
    'dash.historical_sales': 'एकूण ऐतिहासिक विक्री',
    'dash.predicted_sales': 'एकूण अंदाजित विक्री',
    'dash.avg_monthly': 'सरासरी मासिक विक्री',
    'dash.accuracy': 'मॉडेल अचूकता',
    'dash.revenue_forecast': 'महसूल अंदाज',
    'dash.historical': 'ऐतिहासिक',
    'dash.predicted': 'अंदाजित',
    'dash.insight': 'अंदाज अंतर्दृष्टी',
    'dash.open_hub': 'फोरकास्टिंग हब उघडा',
    'dash.no_data': 'अद्याप कोणताही डेटा लोड केलेला नाही',
    'dash.upload_data': 'डेटा अपलोड करा',
    'dash.change_dataset': 'डेटासेट बदला',

    'settings.title': 'प्लॅटफॉर्म सेटिंग्ज',
    'settings.subtitle': 'तुमचे वैयक्तिक प्रोफाइल आणि सुरक्षा सेटिंग्ज व्यवस्थापित करा.',
    'settings.profile': 'प्रोफाइल',
    'settings.preferences': 'प्राधान्ये',
    'settings.personal_info': 'वैयक्तिक माहिती',
    'settings.personal_subtitle': 'तुमचा फोटो आणि वैयक्तिक तपशील अपडेट करा.',
    'settings.save_changes': 'बदल जतन करा',
    'settings.first_name': 'पहिले नाव',
    'settings.last_name': 'आडनाव',
    'settings.email': 'ईमेल पत्ता',
    'settings.job_title': 'नोकरीचे शीर्षक',
    'settings.regional': 'प्रादेशिक सेटिंग्ज',
    'settings.language': 'भाषा निवड',
    'settings.date_format': 'तारीख स्वरूप',
    'settings.visual': 'दृश्य सेटिंग्ज',
    'settings.light_mode': 'लाईट मोड',
    'settings.dark_mode': 'डार्क मोड',

    'auth.login_title': 'पुन्हा स्वागत आहे',
    'auth.login_subtitle': 'तुमच्या डॅशबोर्डमध्ये प्रवेश करण्यासाठी तुमची माहिती भरा',
    'auth.signup_title': 'खाते तयार करा',
    'auth.signup_subtitle': 'हजारो विक्री संघांमध्ये सामील व्हा',
    'auth.email': 'ईमेल पत्ता',
    'auth.password': 'पासवर्ड',
    'auth.sign_in': 'साइन इन',
    'auth.sign_up': 'साइन अप',
    'auth.no_account': 'खाते नाही?',
    'auth.have_account': 'आधीच खाते आहे?',
  },
  hi: {
    // हिंदी (Hindi)
    'nav.dashboard': 'डैशबोर्ड',
    'nav.forecasting': 'फोरकास्टिंग हब',
    'nav.data': 'डेटा संकलन',
    'nav.reports': 'रिपोर्ट्स',
    'nav.settings': 'सेटिंग्स',
    'nav.logout': 'लॉगआउट',
    'nav.search': 'खोजें...',
    
    'dash.welcome': 'स्वागत है',
    'dash.title': 'कार्यकारी सारांश',
    'dash.subtitle': 'रीअल-टाइम प्रदर्शन मेट्रिक्स और एआई-सक्षम अनुमान।',
    'dash.historical_sales': 'कुल ऐतिहासिक बिक्री',
    'dash.predicted_sales': 'कुल अनुमानित बिक्री',
    'dash.avg_monthly': 'औसत मासिक बिक्री',
    'dash.accuracy': 'मॉडल सटीकता',
    'dash.revenue_forecast': 'राजस्व पूर्वानुमान',
    'dash.historical': 'ऐतिहासिक',
    'dash.predicted': 'अनुमानित',
    'dash.insight': 'पूर्वानुमान अंतर्दृष्टि',
    'dash.open_hub': 'फोरकास्टिंग हब खोलें',
    'dash.no_data': 'अभी तक कोई डेटा लोड नहीं हुआ है',
    'dash.upload_data': 'डेटा अपलोड करें',
    'dash.change_dataset': 'डेटासेट बदलें',

    'settings.title': 'प्लेटफ़ॉर्म सेटिंग्स',
    'settings.subtitle': 'अपनी व्यक्तिगत प्रोफ़ाइल और सुरक्षा सेटिंग्स प्रबंधित करें।',
    'settings.profile': 'प्रोफ़ाइल',
    'settings.preferences': 'प्राथमिकताएं',
    'settings.personal_info': 'व्यक्तिगत जानकारी',
    'settings.personal_subtitle': 'अपनी फोटो और व्यक्तिगत विवरण अपडेट करें।',
    'settings.save_changes': 'परिवर्तन सहेजें',
    'settings.first_name': 'पहला नाम',
    'settings.last_name': 'अंतिम नाम',
    'settings.email': 'ईमेल पता',
    'settings.job_title': 'पद का नाम',
    'settings.regional': 'क्षेत्रीय सेटिंग्स',
    'settings.language': 'भाषा चयन',
    'settings.date_format': 'तिथि प्रारूप',
    'settings.visual': 'दृश्य सेटिंग्स',
    'settings.light_mode': 'लाइट मोड',
    'settings.dark_mode': 'डार्क मोड',

    'auth.login_title': 'वापसी पर स्वागत है',
    'auth.login_subtitle': 'अपने डैशबोर्ड तक पहुंचने के लिए अपनी जानकारी भरें',
    'auth.signup_title': 'खाता बनाएं',
    'auth.signup_subtitle': 'दुनिया भर में हजारों बिक्री टीमों में शामिल हों',
    'auth.email': 'ईमेल पता',
    'auth.password': 'पासवर्ड',
    'auth.sign_in': 'साइन इन करें',
    'auth.sign_up': 'साइन अप करें',
    'auth.no_account': 'खाता नहीं है?',
    'auth.have_account': 'पहले से ही एक खाता है?',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('app_language') || 'en');

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
