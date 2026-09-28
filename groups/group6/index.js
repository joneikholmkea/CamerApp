/*
 * 📸 FUN CAMERA – YOUR GROUP'S SCREEN
 *
 * This file already works: it shows the camera, takes a photo and shows it.
 * Your job: add ONE fun twist. Pick an idea (or invent your own and ask the teacher):
 *
 *  🖼  Frame or shape overlay – circle mask, polaroid frame, "WANTED" poster, date stamp
 *  ⏱  Countdown shot        – show 3-2-1 on screen, then take the photo automatically
 *  🎞  Photo booth strip     – take 4 photos in a row and show them stacked like a strip
 *  🎨  Color filter          – a see-through colored View on top (sepia, neon, "b&w"),
 *                              with buttons to switch between filters
 *  🥕  Themed challenge      – a random challenge ("Find something red!") and a small
 *                              gallery of the photos taken so far
 *  😎  Emoji stickers        – tap on the captured photo to place emojis
 *  🪞  Selfie mirror mode    – front camera, preview mirrored and shown twice side by side
 *
 * RULES
 *  - Only edit files inside YOUR group folder. You may add new files there.
 *  - Do not install new packages.
 *  - Broke everything? Copy groups/_starter/CameraStarter.tsx back into this file.
 */
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView } from "expo-camera";
import {
  PermissionGate,
  pickFromGallery,
  useCameraSetup,
} from "../../components/shared";

// ✏️ Change this to rename your screen and pick your emoji on the home screen.
export const meta = {
  title: "Wanted!",
  emoji: "🤠",
};

// The silly crimes that can show up on the poster. Add your own!
const CRIMES = [
  "Kommer 30 minutter forsent til undervisning",
  "Kl. 9 har du allerede drukket 2 redbulls og en kop kaffe",
  "Glemt din computeroplader",
  "Skal på arbejde så jeg har ikke tid til gruppearbejde",
];

export default function CameraScreen() {
  // Camera helpers: permission, a ref to the camera, and front/back switching.
  const { permission, requestPermission, cameraRef, facing, toggleFacing } =
    useCameraSetup();

  // The URI (file path) of the last photo. null = no photo yet, show the camera.
  const [photoUri, setPhotoUri] = useState(null);

  // The camera needs a moment to start. We can't take a photo before it's ready.
  const [isCameraReady, setIsCameraReady] = useState(false);

  // The silly crime written on the WANTED poster.
  const [crime, setCrime] = useState("");

  // Show a photo on the poster, together with a random crime.
  function showPhoto(uri) {
    setPhotoUri(uri);
    setCrime(CRIMES[Math.floor(Math.random() * CRIMES.length)]);
  }

  // Take a photo and remember where it was saved.
  async function takePhoto() {
    if (!cameraRef.current || !isCameraReady) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
    showPhoto(photo.uri);
  }

  // No camera (e.g. simulator)? Pick a photo from the gallery instead.
  async function pickPhoto() {
    const uri = await pickFromGallery();
    if (uri) showPhoto(uri);
  }

  // Go back to the camera.
  function retake() {
    setPhotoUri(null);
    setIsCameraReady(false); // the camera starts again, so wait for it
  }

  // ─────────────────────────────────────────────────────────────
  // SCREEN 1: we have a photo → show it
  // ─────────────────────────────────────────────────────────────
  if (photoUri) {
    return (
      <View style={styles.poster}>
        <Text style={styles.wanted}>WANTED</Text>
        <Text style={styles.subtitle}>DEAD OR ALIVE</Text>

        <Image
          source={{ uri: photoUri }}
          style={styles.mugshot}
          resizeMode="cover"
        />

        <Text style={styles.crime}>For: {crime}</Text>
        <Text style={styles.reward}>REWARD $1.000.000</Text>

        <View style={styles.bottomBar}>
          <Pressable style={styles.textButton} onPress={retake}>
            <Text style={styles.textButtonLabel}>↩️ Retake</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // SCREEN 2: no photo yet → show the live camera
  // ─────────────────────────────────────────────────────────────
  return (
    <PermissionGate
      permission={permission}
      requestPermission={requestPermission}
    >
      <View style={styles.container}>
        {/* The live camera. Don't put children inside CameraView –
            put overlays next to it (below), they're drawn on top. */}
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          onCameraReady={() => setIsCameraReady(true)}
        />

        {/* 🎨 YOUR OVERLAY GOES HERE – anything rendered here appears on top of the camera */}

        {/* Switch between front and back camera (top right). */}
        <Pressable style={styles.flipButton} onPress={toggleFacing}>
          <Text style={styles.iconLabel}>🔄</Text>
        </Pressable>

        {/* Bottom row: Gallery – Capture – (empty space to keep capture centered) */}
        <View style={styles.bottomBar}>
          <Pressable style={styles.sideButton} onPress={pickPhoto}>
            <Text style={styles.iconLabel}>🖼️</Text>
            <Text style={styles.smallLabel}>Gallery</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.captureButton,
              pressed && styles.capturePressed,
              !isCameraReady && styles.captureDisabled,
            ]}
            onPress={takePhoto}
            disabled={!isCameraReady}
          >
            <View style={styles.captureInner} />
          </Pressable>

          <View style={styles.sideButton} />
        </View>
      </View>
    </PermissionGate>
  );
}

// All the styles for this screen. Change colors and sizes freely!
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  wanted: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 72,
    fontWeight: "900",
    color: "black",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  capturePressed: { transform: [{ scale: 0.92 }] },
  captureDisabled: { opacity: 0.4 },
  sideButton: { width: 64, alignItems: "center" },
  flipButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLabel: { fontSize: 26 },
  smallLabel: { color: "white", fontSize: 12, marginTop: 2 },
  textButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  textButtonLabel: { color: "white", fontSize: 18, fontWeight: "600" },

  // 🤠 The WANTED poster
  poster: {
    flex: 1,
    backgroundColor: "#e8d3a3",
    alignItems: "center",
    paddingTop: 40,
  },
  wanted: {
    fontSize: 72,
    fontWeight: "900",
    color: "#4a2c0f",
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4a2c0f",
    marginBottom: 16,
  },
  mugshot: { width: 260, height: 300, borderWidth: 6, borderColor: "#4a2c0f" },
  crime: { fontSize: 20, fontStyle: "italic", color: "#4a2c0f", marginTop: 16 },
  reward: { fontSize: 32, fontWeight: "900", color: "#8b0000", marginTop: 8 },
});
