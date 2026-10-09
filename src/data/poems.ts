export const MOODS = [
  "Tender",
  "Longing",
  "Grief",
  "Joy",
  "Anger",
  "Wonder",
  "Unsorted",
] as const;

export type Mood = (typeof MOODS)[number];

export type PaperType = "sticky" | "torn" | "folded" | "postcard" | "letter" | "plain";

export type PaperColor = "cream" | "blush" | "sage" | "blue" | "lilac" | "sun" | "white" | "kraft";

export type Poem = {
  id: string;
  slug: string;
  title: string;
  body: string;
  mood: Mood;
  paperType: PaperType;
  paperColor: PaperColor;
  rotation: number;
  initialX: number;
  initialY: number;
  date?: string;
  excerpt?: string;
  featured?: boolean;
  tags: string[];
  altText?: string;
};

const ROTATIONS = [-1.6, 1.2, -0.5, 1.7, -1.1, 0.8, -2, 1.4] as const;

function placed(index: number): Pick<Poem, "rotation" | "initialX" | "initialY"> {
  const col = index % 5;
  const row = Math.floor(index / 5);
  return {
    rotation: ROTATIONS[index % ROTATIONS.length] ?? 0,
    initialX: 48 + col * 300 + (row % 2) * 28,
    initialY: 36 + row * 320,
  };
}

export const poems: Poem[] = [
  {
    id: "remember",
    slug: "people-who-remember-me",
    title: "people who remember me",
    mood: "Wonder",
    paperType: "folded",
    paperColor: "cream",
    ...placed(0),
    tags: ["memory", "friends"],
    excerpt: "there are people who still know me",
    altText: "Cream folded note",
    body: `there are people who still know me
as someone i don’t recognise anymore.
they remember the old haircut,
the stupid joke i always made,
the person i was trying so hard to impress.
they say my name like nothing has changed.
and for a second, i am seventeen again,
standing exactly where they remember me.
it’s strange how growing up
doesn’t happen equally
inside everyone else’s memory.
somewhere in their heads,
i am still becoming who i am now.
maybe that’s why 
old friends feel a little unfamiliar.
they aren’t meeting a stranger.
they’re meeting someone
i haven’t been for years.
~shreeraj`,
  },
  {
    id: "three-days",
    slug: "three-days",
    title: "three days",
    mood: "Joy",
    paperType: "sticky",
    paperColor: "sun",
    ...placed(1),
    tags: ["beginnings"],
    excerpt: "It’s barely been three days,",
    altText: "Sun sticky note",
    body: `It’s barely been three days,
but somehow you’ve slipped into my hours
like sunrise sneaking past a half-closed curtain,
quiet, warm, impossible to ignore.
There’s this soft gravity in the way you speak,
like your voice knows the shortcuts
to the calmer parts of my mind.
And every time my phone lights up,
my heart behaves like it never learned restraint.
I don’t know what we’re building yet,
but it feels like the start of something
that leans in closer each night,
a tiny spark pretending it isn’t already a flame.
All I know is:
I like the way you make the world feel lighter,
I like the way time disappears with you,
and I like this strange, beautiful hook
we’ve both fallen into
so willingly.
~shreeraj`,
  },
  {
    id: "strangers",
    slug: "becoming-strangers",
    title: "becoming strangers",
    mood: "Grief",
    paperType: "torn",
    paperColor: "blue",
    ...placed(2),
    tags: ["distance", "friendship"],
    excerpt: "there wasn’t a moment",
    altText: "Blue torn sheet",
    body: `there wasn’t a moment
when we stopped knowing each other.
i still remember your birthday,
the way you took your coffee,
the story you told me about your mother.
i still know which songs
you used to skip.
that’s what makes it strange.
nothing happened badly enough
to explain the distance.
we just kept becoming
slightly different people,
on separate days,
in separate places.
until knowing everything about you
became knowing that
i don’t know anything anymore.
~shreeraj`,
  },
  {
    id: "garden",
    slug: "does-love-live-here",
    title: "does love live here?",
    mood: "Grief",
    paperType: "letter",
    paperColor: "sage",
    ...placed(3),
    tags: ["garden", "habit"],
    excerpt: "the garden still waits,",
    altText: "Sage letter",
    body: `the garden still waits,
for footsteps that stopped coming...
years ago.
i water what no longer believes in rain.
every new leaf,
feels less like hope,
and more like habit.
perhaps...
nothing here is growing.
perhaps i’ve only mistaken survival...
for spring.
~shreeraj`,
  },
  {
    id: "allow-me",
    slug: "allow-me-this-much",
    title: "allow me this much",
    mood: "Longing",
    paperType: "letter",
    paperColor: "blush",
    ...placed(4),
    tags: ["moon", "unrequited"],
    excerpt: "i know we'll never be together,",
    altText: "Blush letter",
    body: `i know we'll never be together,
but please... allow me this much.
let me tell you how, 
in a sky crowded with stars,
you remain the only 'moon' i see.
how, among billions of face in this world,
it is only your eyes i ever search for.
let me tell you,
how you are the fire i would reach for,
with the fear of being burned.
the warmth i would choose,
even after knowing the cost.
i know we will never be together,
but please, allow me to love you aloud,
to love you in ways you've never heard,
and perhaps never felt.
even if only once.`,
  },
  {
    id: "three-feet",
    slug: "three-feet-away",
    title: "three feet away",
    mood: "Wonder",
    paperType: "postcard",
    paperColor: "white",
    ...placed(5),
    tags: ["photographs", "strangers"],
    excerpt: "i wonder how many strangers,",
    altText: "White postcard",
    body: `i wonder how many strangers,
have taken me home in photographs.
me, crossing behind their birthday dinner,
half a face in somebody’s graduation,
waiting for a light to change,
while two people behind me
were falling in love.
maybe i’m framed on a wall somewhere,
blurred behind a family
that has since become larger.
maybe someone has looked at that picture
a thousand times
and never once looked at me.
that’s the strange part i feel
i could have been standing,
three feet from the moment,
someone would spend their whole life remembering,
and to me,
it was just a place i was passing through.
~shreeraj`,
  },
  {
    id: "no-bad-blood",
    slug: "no-bad-blood",
    title: "no bad blood",
    mood: "Grief",
    paperType: "plain",
    paperColor: "kraft",
    ...placed(6),
    tags: ["friendship", "silence"],
    excerpt: "there was no last conversation,",
    altText: "Kraft sheet",
    body: `there was no last conversation,
which is strange, considering
how many conversations there were.
no slammed doors, no final words,
nothing worth blaming on either of us.
just replies that took a little longer,
plans that became “we should,”
then “sometime,”
then nothing at all.
somewhere between then and now
we became people
who would be happy to see each other
and never make plans to.
i think that’s what gets me...
we didn’t lose each other.
we just stopped being where the other one looked.
~shreeraj`,
  },
  {
    id: "laapata",
    slug: "laapata",
    title: "laapata",
    mood: "Grief",
    paperType: "torn",
    paperColor: "lilac",
    ...placed(7),
    tags: ["lost", "time"],
    excerpt: "sheher se poochha mera pata,",
    altText: "Lilac torn sheet",
    body: `sheher se poochha mera pata,
bola, “yahin tha... ab laapata.”
khwaabon ka qarz bhi chukta nahi,
aur waqt kisi ka rukta nahi.
mein khud se bhagu gali-gali,
har mod pe apni kami mili.
jo banna tha, woh bana nahi,
jo ban gaya, woh chuna nahi.
ab raat se meri yaari hai,
khamoshi bhi jaisi fankaari hai.
mere kal ki fikr mein aaj gaya,
jo waqt tha mera, woh kahan gaya?
~shreeraj`,
  },
  {
    id: "khabar",
    slug: "khabar-banke-milo",
    title: "khabar banke milo",
    mood: "Longing",
    paperType: "letter",
    paperColor: "blue",
    ...placed(8),
    tags: ["memory", "return"],
    excerpt: "kabhi socha tha tujhe bhool ke aabaad rahoon,",
    altText: "Blue letter",
    body: `kabhi socha tha tujhe bhool ke aabaad rahoon,
har ek yaad ko seene se main aazaad karoon.
phir ye dil kehta hai, kis baat ka inkaar karoon,
jis mein tu hi na rahe, us dil ka kya khayaal karoon.
teri khamoshi bhi lagti hai sadaaon jaisi,
teri doori bhi lage mujhe fizaaon jaisi.
main to ruk kar bhi musafir hi raha inn raahon mein,
tu guzar jaaye to lagti hai duaaon jaisi.
ab jo milna bhi ho, milna to nazar banke milo,
meri tanha si kahaani ka safar banke milo.
main to mitti bhi banun, phir bhi tera hi rahoon,
tum agar laut na sako, meri khabar banke milo.
~shreeraj`,
  },
  {
    id: "almost-her",
    slug: "almost-her",
    title: "almost her",
    mood: "Longing",
    paperType: "folded",
    paperColor: "blush",
    ...placed(9),
    tags: ["memory", "almost"],
    excerpt: "i saw a face today, not hers, but close enough,",
    altText: "Blush folded note",
    body: `i saw a face today, not hers, but close enough,
to wake the ache i’d buried neat and deep.
my pulse betrayed the calm i’d built so tough,
the body always knows what the mind can’t keep.
i blinked it off, pretended nothing stirred,
like how ghosts don’t visit in the shape of light.
a laugh, a turn, the echo blurred,
but it cut like memory’s blade in spite.
so i smiled as strangers do in passing rain,
let silence fold the tremor in my chest.
love’s cruel trick to remind you again,
that healing isn’t peace, it’s just learned rest.
~shreeraj`,
  },
  {
    id: "unlovable",
    slug: "unlovable",
    title: "Unlovable",
    mood: "Longing",
    paperType: "letter",
    paperColor: "cream",
    ...placed(10),
    tags: ["love", "fear"],
    excerpt: "I crave love",
    altText: "Cream letter",
    body: `I crave love
like a hunger I’m embarrassed to admit,
like asking for water
while insisting I don’t deserve the glass.
I tell myself
I am too much in the wrong ways
and not enough in the right ones, 
too childish to be steady,
too practical to be gentle,
too quiet to know the right words
when someone else is breaking.
I imagine her pain
and already see myself failing it.
My hands, empty.
My logic, sharp.
My comfort, clumsy.
So I step back
before I can ruin something sacred.
I say love deserves better than me,
as if that makes me noble,
as if self-rejection is kindness
and not fear wearing good manners.
I practice being alone
like it’s a discipline.
Career. Money. Growth.
Things that don’t ask me
why I go silent
or why I flinch at closeness
or why I love simply
in a world that wants complexity.
People leave.
Not loudly.
Not cruelly.
Just enough times
that absence starts to feel like evidence.
And so I become careful.
I call it maturity.
I call it realism.
But really,
it is a child inside me
learning how to disappear
before being abandoned again.
Still, 
still I want love.
Not fireworks.
Not rescue.
Just someone who stays
when I am quiet,
someone who doesn’t confuse my slowness
for lack of depth,
someone who understands
that my heart speaks softly
because it has learned
what shouting costs.
I don’t think I’m unlovable.
I think I am fragile
in a way the world hasn’t handled gently yet.
And maybe that’s why I ache.
Not because I am broken, 
but because somewhere in me
there is so much love,
waiting to be met
without being proven first.`,
  },
  {
    id: "not-violently",
    slug: "not-violently",
    title: "not violently",
    mood: "Tender",
    paperType: "plain",
    paperColor: "white",
    ...placed(11),
    tags: ["love", "restraint"],
    excerpt: "I don’t love you violently.",
    altText: "White sheet",
    body: `I don’t love you violently.
I don’t need to break myself open,
to prove that I care.
I love you in the choice to stay calm,
to not turn fear into drama,
to not make my feelings your burden.
My love is restraint.
It is trust without surveillance.
It is wanting you
without needing to be wanted back the same way.
I don’t reach for you when I’m loud inside.
I wait until I’m steady.
That’s how I know it’s real.`,
  },
  {
    id: "six-days",
    slug: "six-days-later",
    title: "six days later",
    mood: "Joy",
    paperType: "folded",
    paperColor: "sun",
    ...placed(12),
    tags: ["beginnings", "timing"],
    excerpt: "Six days.",
    altText: "Sun folded note",
    body: `Six days.
That’s all it’s been.
But somehow you’ve threaded yourself
through the quiet corners of my day,
the pauses, the in-betweens,
the moments I didn’t know were waiting for you.
There’s a sweetness to this timing,
like the universe is whispering,
“look closer, this one matters.”
And now we’re two sunrises away,
from standing in the same air,
no screens, no lag,
just you,
your voice,
your eyes meeting mine,
without the safety of distance.
It’s strange how certain things feel right,
before they even fully start.
How six days can undo walls
that took years to build.
How someone can walk in so gently,
yet rearrange the whole room of your heart.
I’m not calling it love,
not yet, not this soon,
but there’s a pull here,
steady and honest,
the kind you feel in your chest
before you dare to name it.
And when I meet you,
day after tomorrow,
I think something quiet inside me
is finally going to click
into place.`,
  },
  {
    id: "six-feet",
    slug: "six-feet-under",
    title: "six feet under",
    mood: "Longing",
    paperType: "torn",
    paperColor: "kraft",
    ...placed(13),
    tags: ["body", "after"],
    excerpt: "when i’m 6 feet under,",
    altText: "Kraft torn sheet",
    body: `when i’m 6 feet under,
and the bugs are eating my heart,
all they will taste is you.
and when they eat my brain,
all they will see are glimpses of you.
when they eat my lungs,
all they’ll breathe is the last sigh i saved for you.
and when they reach my bones,
all they’ll hear is the echo of every word i never said aloud.
and when there’s nothing left of me,
not even dust,
i hope the wind still carries the part of me
that never stopped reaching for you.`,
  },
  {
    id: "khayali",
    slug: "khayali-roop",
    title: "khayali roop",
    mood: "Grief",
    paperType: "letter",
    paperColor: "lilac",
    ...placed(14),
    tags: ["after", "memory"],
    excerpt: "tere jaane ke baad bhi,",
    altText: "Lilac letter",
    body: `tere jaane ke baad bhi,
mera dil ek jhooth sa sambhal kar rakhta hai,
jahan tu ab bhi meri ungli pakad kar chalti hai,
jaise waqt ne hume kabhi toda hi nahi.
par asli baat yeh hai ki,
tu mujhe chhod kar aage badh gayi,
bin palte, bin ruke.
fir bhi main us khayali roop ko jeene deta hoon,
kyunki sach ka dard zyada kaat khaata hai,
aur jhooth thoda sa chain de deta hai.
kabhi lagta hai tu meri kahani ka ehsaas thi,
par main bas teri kahani ka ek rukawat.
aur aaj bhi,
teri yaad ka sannata andar tak bajta rehta hai.`,
  },
  {
    id: "stayed",
    slug: "where-i-stayed",
    title: "where i stayed",
    mood: "Tender",
    paperType: "postcard",
    paperColor: "sage",
    ...placed(15),
    tags: ["memory", "you and me"],
    excerpt: "i went down memory lane again,",
    altText: "Sage postcard",
    body: `i went down memory lane again,
the old wounds, the old ghosts, the familiar ache.
every corner knew my name, 
every stop felt rehearsed.
i walked it anyway because some roads never close.
but this time something shifted, quiet and unreal.
a turn i had never taken, 
a softness i didn’t expect.
a stop that wasn’t stitched with hurt or endings.
a signboard that simply whispered, you and me.
it felt like a place my heart had been building in secret.
a space untouched by fear or running or loss.
a moment where the past finally loosened its grip.
and for once, memory led me somewhere i wanted to stay.
and i stayed.
~shreeraj`,
  },
  {
    id: "fasana",
    slug: "tanha-fasana",
    title: "tanha fasana",
    mood: "Grief",
    paperType: "letter",
    paperColor: "kraft",
    ...placed(16),
    tags: ["loneliness", "night"],
    excerpt: "tu kya jaane, dil ke andheron mein kya bhatak raha hoon main,",
    altText: "Kraft letter",
    body: `tu kya jaane, dil ke andheron mein kya bhatak raha hoon main,
khud ki hi saanson ka bojh bankar, khud ko hi daba raha hoon main.
logon ke beech bhi tanha,
ghar ki deewaron tak mehdood.
darr itna gehra hai ki
mohabbat ka khayal bhi lagta hai jurm-e-khudsooz.
dostiyon mein bhi aksar lagta hai ki
main bas waqt ka khaali kona hoon.
jab zaroorat ho tab yaad aata,
phir hawa jaise udd jaata hoon.
mohabbat ka naam sunte hi
seene mein ek thandi si haay utar jaati hai,
jaise kismat keh deti ho
ki tere hisse ki chaandni kisi aur raat rakhi jaati hai.
khud ko pyaar karna mushkil,
aur ghairon ko dil de baithna aadat.
dil ka yeh dard bhi ajeeb.
aakhir kab tak sehunga yeh ibadat.
main khud ko mehmaan samajh kar jeeta hoon,
is duniya ki mehfil mein gawaar sa lagta hoon.
kabhi kisi ki aankhon mein manzil dhoondhta hoon,
kabhi apni hi zindagi mein awaara sa lagta hoon.
haan, main hi woh ladka hoon
jo raat ki khamoshiyon mein toot kar bhi
subah ek jhooti si muskaan pehen leta hai.
duniya samajh leti hai ki main theek hoon.
par dil jaanta hai
ki yeh theek hona ek afsana hai.
ek chhupa hua dard, ek dabaa hua sach.
ek aawara sa, tanha fasana hai.
bas itna samajh le:
main toot kar bhi sachcha hoon,
darr kar bhi zinda hoon,
aur tanha ho kar bhi kisi ka hone ki khwahish rakhta hoon.`,
  },
  {
    id: "same-air",
    slug: "same-air",
    title: "same air",
    mood: "Longing",
    paperType: "sticky",
    paperColor: "blue",
    ...placed(17),
    tags: ["distance", "jealous"],
    excerpt: "lowkey jealous that they breathe the same air you do,",
    altText: "Blue sticky note",
    body: `lowkey jealous that they breathe the same air you do,
hear your laugh without a pixel in view.
while i sit here, screen-lit and still,
chasing your presence through glass and will.
they pass you by, unaware what they’ve got,
while i replay moments that i never forgot.
every word from you feels like gold,
yet slips through my fingers, too far to hold.
distance mocks me in silent grace,
between my heart and your fleeting face.
still i stay, foolish, maybe true,
haunted and healed by the thought of you.
~shreeraj`,
  },
  {
    id: "seconds",
    slug: "between-the-seconds",
    title: "Between the Seconds",
    mood: "Tender",
    paperType: "postcard",
    paperColor: "blush",
    ...placed(18),
    tags: ["closeness", "time"],
    excerpt: "Time don’t move when you’re this close,",
    altText: "Blush postcard",
    body: `Time don’t move when you’re this close,
Heartbeat hums like a song we both know.
Fingertips whisper, tracing the notes,
Skin to skin, where does the air even go?
Silence louder than the bassline drop,
Breath meets breath, but we don’t talk.
The world keeps spinning, but we’re stuck in the spot,
Lost between seconds, right where we stop.
~shreeraj`,
  },
  {
    id: "enough",
    slug: "she-was-enough",
    title: "She was Enough",
    mood: "Tender",
    paperType: "letter",
    paperColor: "cream",
    ...placed(19),
    tags: ["her", "devotion"],
    excerpt: "Guarded heart, a quiet storm,",
    altText: "Cream letter",
    body: `Guarded heart, a quiet storm,
A whisper lost, a love unworn.
Afraid to stay, afraid to leave,
She never thought she could be believed.
Remnants of love she thought would fade,
I swore to her, I’d always stay.
If only she knew, if only she’d see,
That perfection was never the goal, she was perfect to me.
Miles apart, but never gone,
She still lingers in every song.
And if the world rewrote our fate,
I’d find her again, I’d never be late.
2nd idea:
She wasn’t just a person, she was a presence,
A quiet storm, a whisper in the silence.
She held galaxies in her eyes but never believed,
That she was the kind of miracle someone would need.
She feared she was too much, or maybe not enough,
Built walls so high, love had to beg to climb up.
But if only she knew, if only she’d see,
That perfection was never the goal, she was perfect to me.
I’d hold her at her weakest, I’d fight off her fears,
Trade my tomorrows just to wipe her tears.
She was light, she was warmth, she was home in a name,
And I’d burn down the world just to hold her again.`,
  },
  {
    id: "night",
    slug: "when-the-night-holds-you",
    title: "When the Night Holds You",
    mood: "Tender",
    paperType: "folded",
    paperColor: "sage",
    ...placed(20),
    tags: ["comfort", "night"],
    excerpt: "When your world is torn in two,",
    altText: "Sage folded note",
    body: `When your world is torn in two,
and silence hums a broken tune,
I’ll gather stars and light your way,
until the dark surrenders soon.
Let sorrow rest upon my chest,
let every tear be understood,
I’ll hold you close through every storm,
until you rise, until you’re good.
~shreeraj`,
  },
  {
    id: "dreams",
    slug: "i-saw-dreams",
    title: "I Saw Dreams",
    mood: "Wonder",
    paperType: "plain",
    paperColor: "lilac",
    ...placed(21),
    tags: ["dreams", "twilight"],
    excerpt: "I saw dreams,",
    altText: "Lilac sheet",
    body: `I saw dreams, 
woven in twilight,
drifting like autumn leaves,
whispering in a voice I once knew.
They brushed against my fingertips,
soft, fleeting,
like a memory too delicate to hold.
Between them, only silence, 
a quiet sigh, a pause between heartbeats,
the space where longing lingers.
And yet, even as they fade,
they leave behind a warmth,
a promise that dreams, once seen,
never truly disappear.
~shreeraj`,
  },
  {
    id: "unbound",
    slug: "unbound",
    title: "Unbound",
    mood: "Wonder",
    paperType: "torn",
    paperColor: "sun",
    ...placed(22),
    tags: ["music", "surrender"],
    excerpt: "The air hums, heavy with something primal,",
    altText: "Sun torn sheet",
    body: `The air hums, heavy with something primal,
each note curling around me, slow, deliberate,
a touch without hands, a call without words.
It doesn’t just play, it pulls,
deep into the spaces where thought dissolves,
where only sensation remains.
Fingers dance, coaxing the unseen,
the sound thick, warm, electric.
I don’t listen, I surrender.
~shreeraj`,
  },
  {
    id: "returned",
    slug: "a-love-returned",
    title: "a love returned",
    mood: "Joy",
    paperType: "letter",
    paperColor: "blush",
    ...placed(23),
    tags: ["love", "together"],
    excerpt: "i speak your name,",
    altText: "Blush letter",
    body: `i speak your name,
and it feels like the world sighs in relief,
as if it had been waiting
for this exact moment of tenderness.
your eyes, 
oceans i no longer fear to dive into.
they pull me under,
and i sink willingly,
knowing your hand is there to guide me back.
you laugh,
and it feels like sunlight breaking through a storm.
not because it heals me,
but because it reminds me
i was never broken to begin with.
we’ve built a language
from the quiet things:
the brush of fingers,
a glance across a crowded room,
the way your breath finds mine
in the dark.
i hold you,
and the universe shrinks to this moment,
this weight,
this warmth that makes time irrelevant.
there is no before or after,
only now.
sometimes, i think love is too small a word
for what we are.
we are the air between stars,
the gravity that keeps them close.
we are a home
no storm can touch.
and still, i say it, 
not because it captures everything,
but because it captures enough:
i love you,
and you love me,
and the rest of the world
can wait.
thank you for putting up with the sad poems tho :)
~to her`,
  },
  {
    id: "offering",
    slug: "a-quiet-offering",
    title: "a quiet offering",
    mood: "Longing",
    paperType: "folded",
    paperColor: "blue",
    ...placed(24),
    tags: ["unrequited", "silence"],
    excerpt: "i sit in the pause of your sentences,",
    altText: "Blue folded note",
    body: `i sit in the pause of your sentences,
in the spaces between your breaths.
not close enough to matter,
but near enough to hope.
your laughter, 
a light i’ll never touch.
it spills into the room,
warm and careless,
like it doesn’t know i’m here.
i memorized your voice the way sailors map constellations,
searching for a north star
that never points home.
i listen,
but you never call my name.
i gave you my silence,
wrapped in ribbons of longing,
placed it softly at your feet.
you stepped over it,
graceful,
unseeing.
sometimes, i think you do see me, 
a flicker, a glance, a fleeting kindness.
and for a moment,
i am someone
until i am no one again.
i wonder how many times a heart can break
before it learns the rhythm of shattering,
before the ache becomes a melody
only the lonely can hum.
still, i stay.
not because i believe you’ll love me,
but because i don’t know
how to stop offering what you will not take.
~shreeraj`,
  },
  {
    id: "bones",
    slug: "rest-your-bones",
    title: "rest your bones",
    mood: "Tender",
    paperType: "postcard",
    paperColor: "cream",
    ...placed(25),
    tags: ["sea", "together"],
    excerpt: "come rest your bones next to me,",
    altText: "Cream postcard",
    body: `come rest your bones next to me,
and toss all your thoughts to the sea.
ill pull off each of our anchors,
so we can get lost... you and me.
we’ll drift where the moonlight can find us,
with salt on our lips, wild and free.
no maps, no clocks, no directions,
just waves whispering “let it be.”
the world will keep spinning without us,
but tonight, it can spin endlessly.
for once, we’re not running or chasing,
we’re simply here... you and me.
~shreeraj`,
  },
  {
    id: "floor",
    slug: "straight-for-the-floor",
    title: "straight for the floor",
    mood: "Grief",
    paperType: "torn",
    paperColor: "kraft",
    ...placed(26),
    tags: ["night", "drink"],
    excerpt: "i'm heading straight for the floor,",
    altText: "Kraft torn sheet",
    body: `i'm heading straight for the floor,
the alcohol's served it's toll,
and it's headed straight for my skin,
leaving me daft and dim.
my thoughts start to twist and spin,
ghosts of the past crawl in,
the room hums a mournful tune,
as I sway beneath the moon.
a blur of laughter and lies,
spills out from hazy eyes,
I chase a warmth I can’t keep,
then fall in love with sleep.
~shreeraj`,
  },
  {
    id: "priority",
    slug: "someones-priority",
    title: "someone’s priority",
    mood: "Longing",
    paperType: "plain",
    paperColor: "white",
    ...placed(27),
    tags: ["hunger", "care"],
    excerpt: "me: give me something that i’ve never had.",
    altText: "White sheet",
    body: `me: give me something that i’ve never had.
the waiter smiles, eyes soft with pity, one moment sir,
and serves me saying, this is "being someone’s priority."
it tastes like patience, like hands that stay,
like messages that come first not last,
a sweetness my tongue doesn’t yet know how to trust.
he leaves the bill blank, says some things just don't have a price,
and i sit there full, not from the meal,
but from the ache of realizing what i’ve been starving for.
~shreeraj`,
  },
  {
    id: "good-man",
    slug: "good-man",
    title: "Good Man",
    mood: "Grief",
    paperType: "folded",
    paperColor: "sage",
    ...placed(28),
    tags: ["missing", "lessons"],
    excerpt: "i gave my best to a world that don’t give back,",
    altText: "Sage folded note",
    body: `i gave my best to a world that don’t give back,
left pieces of me down every track.
now the nights are long, the truth cuts deep,
but I keep my soul where the lost ones sleep.
i ain’t bitter, just a little scarred,
still standin’ tall with a shattered heart.
love don’t last, but lessons do,
and I’m still a good man, just missin’ you.
~shreeraj`,
  },
  {
    id: "yellow-hearts",
    slug: "yellow-hearts",
    title: "yellow hearts",
    mood: "Grief",
    paperType: "sticky",
    paperColor: "sun",
    ...placed(29),
    tags: ["warning", "scar"],
    excerpt: "She put my name with yellow hearts,",
    altText: "Sun sticky note",
    body: `She put my name with yellow hearts,
Her favorite color like the stars,
I didn't listen very hard,
When she told me she was crazy from the start.
She laughed like storms and broke like glass,
I thought the madness wouldn’t last,
But every glance became a scar,
She told me she was crazy from the start.`,
  },
  {
    id: "kami",
    slug: "tumhari-kami",
    title: "tumhari kami",
    mood: "Longing",
    paperType: "postcard",
    paperColor: "lilac",
    ...placed(30),
    tags: ["absence", "smile"],
    excerpt: "agar talash karu, toh koi mil hi jayega,",
    altText: "Lilac postcard",
    body: `agar talash karu, toh koi mil hi jayega,
magar tumhari tarah kon mujhko chahega.
tumhe jaroor koi chahato se dekhega,
magar woh ankhein hamari bhala kaha se layega.
mohabbat toh phir se ho hi jayegi kisi se,
magar jazbaat mein woh baat kaha rahegi.
tumse judaa hokar jee toh lenge hum,
par har muskurahat mein tumhari kami rahegi.`,
  },
];

const bySlug = new Map(poems.map((poem) => [poem.slug, poem]));
const byId = new Map(poems.map((poem) => [poem.id, poem]));

export function getPoemBySlug(slug: string): Poem | undefined {
  return bySlug.get(slug);
}

export function getPoemById(id: string): Poem | undefined {
  return byId.get(id);
}
