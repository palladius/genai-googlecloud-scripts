# Testing Gemini from Bash

# A simple test

1. First check authentication. Make sure you login with gcloud (or whatever login you want to do) and set up the project_id correctly.

`gcloud auth login`


If you have trouble with loggin in, you can use the following command to set the project_id:

```
$ cp .envrc.dist .envrc
$ vim .envrc # add your project id
$ ./01-setup.sh
```

2. Run the simplest script as a test:

`./gemini-why-is-the-sky-blue.sh`

Response:

```
{
  "candidates": [
    {
      "content": {
        "role": "model",
        "parts": [
          {
            "text": "The sky is blue due to a phenomenon known as Rayleigh scattering. Here's the scientific explanation:\n\n1. Sunlight Composition: Sunlight, which is a form of electromagnetic radiation emitted by the sun, is composed of a spectrum of light waves of different wavelengths and colors. These colors include red, orange, yellow, green, blue, indigo, and violet, which together form the rainbow's spectrum.\n\n2. Scattering of Light: When sunlight enters the Earth's atmosphere, it interacts with molecules and particles present in the air, including nitrogen (N2) and oxygen (O2) molecules, as well as aerosols, dust, and other particles. These particles scatter the incoming sunlight in all directions.\n\n3. Rayleigh Scattering: The amount of scattering depends on the wavelength of light and the size of the particles. Shorter wavelengths of light, such as blue and violet, are scattered more efficiently than longer wavelengths like red and orange. This phenomenon, known as Rayleigh scattering, is named after Lord Rayleigh, who studied and explained it in the late 19th century.\n\n4. Scattering Intensity: The intensity of scattering is inversely proportional to the fourth power of the wavelength of light. This means that blue light with a shorter wavelength is scattered about 16 times more than red light with a longer wavelength.\n\n5. Blue Sky Appearance: As a result of Rayleigh scattering, the shorter-wavelength blue and violet colors are scattered more strongly by the molecules and particles in the atmosphere. When we look up at the sky, we primarily see the blue light that has been scattered in all directions by these particles, making the sky appear blue during the daytime.\n\n6. Color Variations: The scattering intensity can vary depending on the time of day, atmospheric conditions, and the amount of pollutants or particles in the air. At sunrise and sunset, when the sunlight has to travel through more of the atmosphere, more of the shorter wavelength light is scattered away, leaving the longer wavelength colors like red and orange to dominate, resulting in the colorful sky we see during those times.\n\n7. Blue Color Dominance: Although violet light has a slightly shorter wavelength than blue light, it is absorbed more by the Earth's atmosphere and by the ozone layer, which protects the Earth from harmful ultraviolet (UV) radiation. As a result, we primarily perceive the scattered blue light, making the sky appear blue to our eyes."
          }
        ]
      }
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 6,
    "candidatesTokenCount": 485,
    "totalTokenCount": 491
  }
}
```

Bingo! It tells you about Raileigh Scattering and also how much did you spend (491 tokens, should be less than 1 cent).

If this works, great, we can move into more interesting stuff!

## Hey Gemini, describe what you see..

Let's start asking Gemini about images!

Let's start with one of my favouritest albums of all time: **Selling England by the pound**.

![Alt text](images/genesis-selling-england.jpg?raw=true "Genesis - Selling England by the pound")


```
./gemini-generic.sh images/genesis-selling-england.jpg Describe what you see
# 🤌  QUESTION: Describe what you see
# 🌡️ TEMPERATURE: 0.2
# 👀 Examining image images/genesis-selling-england.jpg: JPEG image data, JFIF standard 1.01, resolution (DPI), density 96x96, segment length 16, baseline, precision 8, 536x528, components 3.
# ♊ Gemini no Saga answer for you:
The cover of Genesis' album Selling England by the Pound features a painting by British artist Paul Whitehead. The painting depicts a group of people in a park, with a man sleeping on a bench in the foreground. The people are all wearing clothes from the 1920s or 1930s, and the painting has a nostalgic, almost surreal feel to it. The colors are muted and the figures are slightly blurred, which gives the painting a dreamlike quality. The painting is also full of symbolism, with the sleeping man representing England and the people around him representing the different aspects of English society. The painting has been interpreted in many different ways, but it is generally seen as a commentary on the state of England in the 1970s.
```

A quick googling confirms that https://en.wikipedia.org/wiki/Paul_Whitehead actually covered one of my favourite album of all times. If you love Genesis too and want to see me play Firth of Fifth, please check https://www.youtube.com/watch?v=4VBxd9n1dSU

## Let's try a few more images

TODO

## Let's compare TWO images!



## Introducing Audio!

Why don't we throw some audio in the mix?

My ``./tts.sh` creates an MP3 out of an english (or Italian!) text given in ARGV. Convenient uh?

```
$ make age-test
=> equivalent to:
$ GENERATE_MP3=true ./gemini-generic.sh images/ricc-family-with-santa.jpg Tell me the age of the people you see, from left to right.
# 🤌  QUESTION: Tell me the age of the people you see, from left to right.
# 🌡️  TEMPERATURE: 0.2
# 👀 Examining image images/ricc-family-with-santa.jpg: JPEG image data, JFIF standard 1.01, aspect ratio, density 1x1, segment length 16, Exif Standard: [TIFF image data, little-endian, direntries=3, software=Google], baseline, precision 8, 1164x826, components 3.
# ♊ Gemini no Saga answer for you:
1. 30-35
2. 2-3
3. 40-45
4. 2-3
5. 60-65
[..]
All good. MP3 created: 't.1. 30-35 2. 2-3 3. 40-45 4. 2-3 5. 60-65.mp3'
```

Now, interestingly it also creates an MP3 of the answer. Not super interesting with all thes enumbers, but might be nice to see it for longer verbose answers. You can hear it under `output/` folder. ("output/t.1. 30-35 2. 2-3 3. 40-45 4. 2-3 5. 60-65.mp3") [output/t.1. 30-35 2. 2-3 3. 40-45 4. 2-3 5. 60-65.mp3](output/t.1. 30-35 2. 2-3 3. 40-45 4. 2-3 5. 60-65.mp3).

### Troubleshooting

Sometimes the TTS script gives me auth warning. You can fix it by re-authenticating through ADC:

```
 $ gcloud auth application-default login
 $ gcloud auth application-default set-quota-project "$PROJECT_ID"
```

Another way is to download a key and put it under `private/PROJECT_ID.json`.
My magic script `01-setup.sh` will pick it up automagically and log in through it :)

More info here: https://cloud.google.com/docs/authentication/troubleshoot-adc#user-creds-client-based