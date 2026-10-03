import React from 'react';
import { StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  // L'adresse IP locale de ton ordinateur sur le réseau Wi-Fi
  // Une fois en production, il suffira de remplacer par "https://lekkrek.com"
  const webUrl = 'http://192.168.1.6:5173';

  return (
    <SafeAreaView style={styles.container}>
      <WebView 
        source={{ uri: webUrl }} 
        style={styles.webview}
        // Ces options assurent que l'expérience est parfaitement fluide comme une vraie app
        allowsBackForwardNavigationGestures={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // Gérer l'encoche (Notch) sur iOS et Android
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
});
