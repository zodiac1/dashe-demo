import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSession } from '../context/SessionContext';

export default function SaleEntryScreen() {
  const { accessToken, userId } = useSession();
  const [property, setProperty] = useState('');
  const [propertyOptions, setPropertyOptions] = useState([
    { label: 'Select a property...', value: '' }
  ]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProperties(true);
      try {
        const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
        const res = await fetch(`${apiBaseUrl}/unsold-properties`, {
          headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
        });
        const data = await res.json();
        // Expecting data to be an array of { id, name } or similar
        const options = [
          { label: 'Select a property...', value: '' },
          ...data.map((item: any) => ({ label: item.address1, value: item.property_id }))
        ];
        setPropertyOptions(options);
      } catch (e) {
        setPropertyOptions([{ label: 'Failed to load properties', value: '' }]);
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchProperties();
  }, [accessToken]);
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setSubmitted(false);
    if (!property || !userId || !date || !amount) {
      // Optionally, set an error state here
      return;
    }
    try {
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/property-sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          property_id: property,
          userid: userId,
          sold_date: date,
          sold_for: amount,
        }),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        // Optionally, handle error response
        setSubmitted(false);
      }
    } catch (e) {
      setSubmitted(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sale Entry</Text>
      <View style={styles.pickerContainer}>
        {loadingProperties ? (
          <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 12 }} />
        ) : (
          <Picker
            selectedValue={property}
            onValueChange={setProperty}
            style={styles.picker}
          >
            {propertyOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        )}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Date of Sale (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount Sold For"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button title="Submit" onPress={handleSubmit} />
      {submitted && (
        <Text style={styles.success}>Sale entry submitted!</Text>
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
  pickerContainer: {
    width: '80%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 40,
  },
  success: {
    color: 'green',
    marginTop: 16,
  },
});
