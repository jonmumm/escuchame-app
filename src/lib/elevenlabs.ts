// Example usage:
// getVoiceTrack('21m00Tcm4TlvDq8ikWAM', 'hola me llamo juan').then(data => {
//   if (data) {
//     // Handle the audio data here...
//   }
// });

import { z } from "astro/zod";

const envSchema = z.object({
  ELEVENLABS_API_KEY: z.string(),
});
const { ELEVENLABS_API_KEY } = envSchema.parse(process.env);

export async function getVoiceTrack(
  voiceId: string,
  text: string
): Promise<Response> {
  const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=0&output_format=mp3_44100_128`;

  const requestData = {
    text,
    model_id: "eleven_multilingual_v1",
    voice_settings: {
      stability: 0,
      similarity_boost: 0,
      style: 0,
      use_speaker_boost: true,
    },
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      accept: "audio/mpeg",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP error! Status: ${response.status}: ` + text);
  }

  return response;
}
