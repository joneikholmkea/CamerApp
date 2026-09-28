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
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { PermissionGate, pickFromGallery, useCameraSetup } from '../../components/shared';

// ✏️ Change this to rename your screen and pick your emoji on the home screen.
export const meta = {
  title: 'Group 4',
  emoji: '🌮',
};

export default function CameraScreen() {
  // Camera helpers: permission, a ref to the camera, and front/back switching.
  const { permission, requestPermission, cameraRef, facing, toggleFacing } = useCameraSetup();

  // The URI (file path) of the last photo. null = no photo yet, show the camera.
  const [photoUri, setPhotoUri] = useState(null);

  // The camera needs a moment to start. We can't take a photo before it's ready.
  const [isCameraReady, setIsCameraReady] = useState(true);


  const [count, setCount] = useState(null);
  // Shows a countdown before taking the photo itself
  function countdown() {
    if (count !== null) return;   // ignorer tryk, mens nedtællingen kører

    let n = 3;
    setCount(n);

    const id = setInterval(() => {
      n -= 1;
      if (n > 0) {
        setCount(n)
      } else {
        clearInterval(id);
        setCount(null);
        takePhoto();
      }
    }, 1000)

  }

  // Take a photo and remember where it was saved.
  async function takePhoto() {
    if (!cameraRef.current || !isCameraReady) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
    setPhotoUri(photo.uri);
  }

  // No camera (e.g. simulator)? Pick a photo from the gallery instead.
  async function pickPhoto() {
    const uri = await pickFromGallery();
    if (uri) setPhotoUri(uri);
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
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />

        {/* 🎨 YOUR PHOTO OVERLAY GOES HERE – anything rendered here appears on top of the photo
            (frames, stickers, date stamps...). Use position: 'absolute' to place things. */}

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
    <PermissionGate permission={permission} requestPermission={requestPermission}>
      <View style={styles.container}>
        {/* The live camera. Don't put children inside CameraView –
            put overlays next to it (below), they're drawn on top. */}
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          onCameraReady={() => setIsCameraReady(true)}
        />

        {count !== null && (
            <View style={styles.countOverlay} pointerEvents="none">
              <Text style={styles.countText}>{count}</Text>
            </View>
        )}

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

          <Pressable style={styles.sideButtonX} onPress={countdown} disabled={!isCameraReady}>
            <Text style={styles.iconLabel}>📸</Text>
            <Text style={styles.smallLabel}>Count down</Text>
          </Pressable>
        </View>
      </View>
    </PermissionGate>
  );
}

// All the styles for this screen. Change colors and sizes freely!
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: 'white',
    fontSize: 120,
    fontWeight: 'bold',
  },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white' },
  capturePressed: { transform: [{ scale: 0.92 }] },
  captureDisabled: { opacity: 0.4 },
  sideButton: { width: 64, alignItems: 'center' },
  sideButtonX:{width: 64, alignItems: 'center'},
  flipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: { fontSize: 26 },
  smallLabel: { color: 'white', fontSize: 12, marginTop: 2 },
  textButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 24,
    paddingVertical: 19,
    borderRadius: 24,
  },

  textButtonLabel: { color: 'white', fontSize: 18, fontWeight: '600' },

  countdownWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdown: {
    fontSize: 120,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowRadius: 8,
  },

});
