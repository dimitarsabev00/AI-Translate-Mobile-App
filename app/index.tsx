import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

export default function Home() {
  const [input, setInput] = useState('');

  return (
    <View className="mx-auto w-full max-w-xl">
      <Stack.Screen options={{ title: 'AI Translate' }} />

      {/* Language selector row */}
      <View className="flex-row justify-around p-5">
        <Text className="font-semibold color-blue-600">English</Text>
        <FontAwesome5 name="exchange-alt" size={16} color="gray" />
        <Text className="font-semibold color-blue-600">Bulgarian</Text>
      </View>

      {/* Input container */}
      <View className="border-y border-gray-300 p-5">
        <View className="flex-row gap-5">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Enter your text"
            className="min-h-32 flex-1 text-xl"
            multiline
            maxLength={500}
          />
          <FontAwesome6 name="circle-arrow-right" size={24} color="royalblue" />
        </View>
        <View className="flex-row justify-between">
          <FontAwesome6 name="microphone" size={18} color="dimgray" />
          <Text className={input.length > 100 ? 'color-red-500' : 'color-gray-500'}>
            {input.length} / 500
          </Text>
        </View>
      </View>

      {/* Output container */}

      <View className="gap-5 bg-gray-200 p-5">
        <Text className="min-h-32 text-xl">output</Text>
        <View className="flex-row justify-between">
          <FontAwesome6 name="volume-high" size={18} color="dimgray" />
          <FontAwesome5 name="copy" size={18} color="dimgray" />
        </View>
      </View>
    </View>
  );
}
