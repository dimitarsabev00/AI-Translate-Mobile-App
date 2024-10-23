import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { supabase } from '~/utils/supabase';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export default function Home() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const [recording, setRecording] = useState<Audio.Recording>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const translate = async (text: string) => {
    const { data } = await supabase.functions.invoke('translate', {
      body: JSON.stringify({ input: text, from: 'English', to: 'Bulgarian' }),
    });

    return data?.content || 'Something went wrong!';
  };

  const onTranslate = async () => {
    const translation = await translate(input);
    setOutput(translation);
  };

  const textToSpeech = async (text: string) => {
    const { data } = await supabase.functions.invoke('text-to-speech', {
      body: JSON.stringify({ input: text }),
    });
    if (data) {
      const { sound } = await Audio.Sound.createAsync({
        uri: `data:audio/mp3;base64,${data.mp3Base64}`,
      });
      sound.playAsync();
    }
  };

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      return;
    }
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    if (uri) {
      const audioBase64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: JSON.stringify({ audioBase64 }),
      });
      setInput(data.text);
      const translation = await translate(data.text);
      setOutput(translation);
    }
  };

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
          <FontAwesome6
            onPress={onTranslate}
            name="circle-arrow-right"
            size={24}
            color="royalblue"
          />
        </View>
        <View className="flex-row justify-between">
          {recording ? (
            <FontAwesome5 onPress={stopRecording} name="stop-circle" size={24} color="royalblue" />
          ) : (
            <FontAwesome6 onPress={startRecording} name="microphone" size={18} color="dimgray" />
          )}
          <Text className={input.length > 100 ? 'color-red-500' : 'color-gray-500'}>
            {input.length} / 500
          </Text>
        </View>
      </View>

      {output && (
        <View className="gap-5 bg-gray-200 p-5">
          <Text className="min-h-32 text-xl">{output}</Text>
          <View className="flex-row justify-between">
            <FontAwesome6
              onPress={() => textToSpeech(output)}
              name="volume-high"
              size={18}
              color="dimgray"
            />
            <FontAwesome5 name="copy" size={18} color="dimgray" />
          </View>
        </View>
      )}
    </View>
  );
}
