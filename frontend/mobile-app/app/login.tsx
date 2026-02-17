import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../context/SessionContext';

// Do not wrap this in a <form> element. Only use Button/onPress to avoid accidental GET requests.
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setSession } = useSession();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const formBody = new URLSearchParams();
      formBody.append('username', username);
      formBody.append('password', password);
      const response = await fetch(`${process.env.VITE_API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      });
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        const text = await response.text();
        setError('Server error: ' + text);
        return;
      }
      
      if (!response.ok) {
        setError('Server error: ' + JSON.stringify(data));
        return;
      }
      if (data.access_token && data.userid) {
        setSession({ accessToken: data.access_token, userId: data.userid });
        // Navigate to sale entry screen using Expo Router
        router.replace('/SaleEntryScreen');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 12 }} />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
});
