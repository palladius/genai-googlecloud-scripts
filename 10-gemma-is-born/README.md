
Looking at🧮:

1. Great Video from Mark Ryan: https://www.youtube.com/watch?v=BM3wzKSPOoI which shows you how to deploy it.
2. This script shows you how to interrogate it from CLI (bash curl!). Feel free to change the ENV vars to your parameters.

## samples

1. Ask Gemma for a sample static question:


```bash
$ ./gemma-hello.sh
[..]]
"Prompt: Hello Gemma. What's the difference between a city bike and a racing bike?
Output:
Sure, Gemma. Here's the difference between a city bike and a racing bike:

**City Bike:**

- Designed primarily for leisurely riding around the city, commuting, and exercising.
- Usually have wider tires for stability and comfort on city streets.
- Have lower handlebars for a more upright riding position.
- Many have chain guards and racks for carrying groceries or other items.
- Typically have less gear than a racing bike.

**Racing Bike:**

- Designed for speed and performance on racing tracks.
- Have narrow tires for better aerodynamics and handling.
- Have high handlebars for a more aggressive riding position.
- Lack chain guards and racks to reduce weight.
- Have a higher gear ratio for reaching top speeds.

**Other Differences:**

- **Frame:** City bikes typically have a frame made of steel or aluminum, while racing bikes have frames made of carbon fiber.
- **Gears:** City bikes usually have a single chainring and multiple sprockets, while racing bikes have multiple chainrings and sprockets.
- **Wheels:** City bikes have wider wheels for stability, while racing bikes have narrower wheels for better handling.
- **Breaks:** City bikes have drum brakes, while racing bikes have disc brakes.

I hope this explanation helps, Gemma. If you have any further questions, please feel free to ask."
```

And now a generic answer:

```bash
$ ./gemma-ask.sh 'I bouth a box of 12 chocolates and my kids ate 2 of them each. How many chocolates are left? Answer in JSON'

"Prompt:
I bouth a box of 12 chocolates and my kids ate 2 of them each. How many chocolates are left? Answer in JSON
Output:
 format

` ` `
{
  \"answer\": 8
}
` ` `
```

... which in markdown renders as:

"Prompt:
I bouth a box of 12 chocolates and my kids ate 2 of them each. How many chocolates are left? Answer in JSON
Output:
 format

```
{
  \"answer\": 8
}
```
