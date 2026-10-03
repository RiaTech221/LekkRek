import React from 'react';
import { StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const webUrl = 'http://192.168.1.6:5173/mobile';

  return (
    <SafeAreaView style={styles.container}>
      <WebView 
        source={{ uri: webUrl }} 
        style={styles.webview}
        allowsBackForwardNavigationGestures={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        userAgent="LekkRekMobileApp"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
});
