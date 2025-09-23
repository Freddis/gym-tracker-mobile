# Discipline Gym Tracker

This is an [Expo](https://expo.dev) react-native project.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx run ios
   ```

## Building in the development
```
npm run ios
```
or 
```
npx expo start:ios
```
 Start Metro & launch app in Simulator (but assumes something’s already installed).
```
npx rexpo run:ios
``` 
Actually build and install the app into Simulator

## Running on IPhone

Since manuals are getting confusing, the proper steps are there:
1. Run 
```
npx expo prebuild
```
This creates ios project bundled with everything

2. Open project

```
open ./ios/Discipline.xcworkspace
```
3. Select personal team in "Signing & Capabilities"
4. Switch Xcode to Release mode

Top toolbar → Scheme → Select your target (gym-tracker) → Edit Scheme → Build Configuration → Release.

The last one is most crucial since other-wise it's gonna run it with metro which requires local dev server and so on. 

<b>You neither need EAS nor you need a paid apple developer account.</b>

## Tips

Cmd+Shift+A quickly changes the theme in simulator