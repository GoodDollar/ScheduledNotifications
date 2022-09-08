import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  View,
  useColorScheme,
} from 'react-native';
import {UserStorageProvider} from './useUserStorage';
import {OptionsView, NotificationsView} from './Notifications';
import {styles} from './theme';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <UserStorageProvider>
      <SafeAreaView style={styles.scrollView}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}
          contentContainerStyle={styles.scrollView}>
          <View style={styles.container}>
            <OptionsView />
            <NotificationsView />
          </View>
        </ScrollView>
      </SafeAreaView>
    </UserStorageProvider>
  );
};

export default App;
