import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEnvironment } from '../../../context/EnvironmentContext';
import { getCurrentApiBaseUrl } from '../../../config/environment';

export default function MenuScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, theme, setTheme } = useTheme();
  const { environment,  } = useEnvironment();
  const styles = getStyles(colors);
  const url = getCurrentApiBaseUrl();
  const word = new URL(url)?.hostname.split("-")?.[0];
  
  const handleLogout = async () => {
    await AsyncStorage.multiRemove([
      'userToken',
      'userPhone',
      'signInUniqueId',
      'customerCareUserId',
    ]);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  };

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <View style={styles.header}>
         {/* <Text style={styles.headerText}>More</Text> */}
      </View>
      <ScrollView bounces={true} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
         
         <View style={styles.card}>
            <View style={styles.profileRow}>
               <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>🛡️</Text>
               </View>
               <View style={styles.profileTextContainer}>
                  <Text style={styles.profileName}>Admin User</Text>
                  <Text style={styles.profileEmail}>admin@{word}.com</Text>
                  <View style={styles.environmentPill}>
                    <Text style={styles.environmentPillText}>{environment}</Text>
                  </View>
               </View>
            </View>
         </View>

         <View style={styles.card}>
            <MenuItem styles={styles} icon="🔔" title="Send Notification" onPress={() => navigation.navigate('SendNotification' as never)} />
            <MenuItem styles={styles} icon="🔓" title="Get OTP" onPress={() => navigation.navigate('GetOTP' as never)} />
            <MenuItem styles={styles} icon="🔀" title="Fare Multiplier" onPress={() => navigation.navigate('FareMultiplier' as never)} />
            <MenuItem styles={styles} icon="🛫" title="Airport Fare Multiplier" onPress={() => navigation.navigate('AirportFareMultiplier' as never)} />
            <MenuItem styles={styles} icon="📍" title="Rate Per KM" />
            <MenuItem styles={styles} icon="📊" title="App Statistics" isLast={true} />
         </View>

         <View style={styles.card}>
            {/* Embedded Theme Toggle Feature */}
            <View style={styles.themeToggleRow}>
               <Text style={styles.themeToggleTitle}>🎨 Appearance</Text>
               <View style={styles.themeToggleButtons}>
                  <TouchableOpacity 
                     style={[styles.themeBtn, theme === 'light' && styles.themeBtnActive]} 
                     onPress={() => setTheme('light')}
                  >
                     <Text style={[styles.themeBtnText, theme === 'light' && styles.themeBtnTextActive]}>Light</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                     style={[styles.themeBtn, theme === 'dark' && styles.themeBtnActive]} 
                     onPress={() => setTheme('dark')}
                  >
                     <Text style={[styles.themeBtnText, theme === 'dark' && styles.themeBtnTextActive]}>Dark</Text>
                  </TouchableOpacity>
                  {/* <TouchableOpacity 
                     style={[styles.themeBtn, theme === 'system' && styles.themeBtnActive]} 
                     onPress={() => setTheme('system')}
                  >
                     <Text style={[styles.themeBtnText, theme === 'system' && styles.themeBtnTextActive]}>Auto</Text>
                  </TouchableOpacity> */}
               </View>
            </View>

            <MenuItem styles={styles} icon="⚙️" title="Settings" />
            <MenuItem styles={styles} icon="❓" title="Help & Support" />
            <MenuItem 
               styles={styles}
               icon="🚪" 
               title="Logout" 
               isLast={true} 
               isDestructive={true} 
               onPress={handleLogout} 
            />
         </View>

      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, title, isLast = false, isDestructive = false, onPress, styles }: any) {
  return (
    <TouchableOpacity 
      style={[styles.menuItem, !isLast && styles.menuItemBorder]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuItemTitle, isDestructive && styles.destructiveText]}>{title}</Text>
      <Text style={styles.menuChevron}>›</Text>
    </TouchableOpacity>
  );
}
