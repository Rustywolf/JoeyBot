var difflib = require('difflib');

var MATCH_RATIO = 0.8;

var NAMES = {
    Draw_Sense_SpellTrap: "Draw Sense: Spell/Trap",
    Beatdown: "Beatdown!",
    Draw_Sense_High_Level: "Draw Sense: High Level",
    LP_Boost_a: "LP Boost a",
    Roll_n_Boost: "Roll 'n' Boost",
    LP_Boost_y: "LP Boost ?",
    Duel_standby: "Duel, standby!",
    LP_Boost_b: "LP Boost ß",
    Draw_Sense_WIND: "Draw Sense: WIND",
    Harpies_Last_Will: "Harpies' Last Will",
    Harpies_Hunting_Ground: "Harpie's Hunting Ground",
    Draw_Sense_Low_Level: "Draw Sense: Low Level",
    Draw_Sense_High_Level: "Draw Sense: High Level",
    Draw_Sense_WATER: "Draw Sense: WATER",
    Cheaters_Coin: "Cheater's Coin",
    Fairys_Smile: "Fairy's Smile",
    Gravekeepers_lot: "Gravekeeper's lot",
    Its_a_Toon_World: "It's a Toon World",
    Extra_Extra: "Extra, Extra"
};

var DATA = {
    Reinforcement: "Return 1 card from your hand to your Deck and draw a random Warrior-Type monster.",
    Switcheroo: "Can be used each time your Life Points decrease by 1000. Return 1 card in your hand to your Deck and draw another. This skill can only be used once per turn and twice per Duel.",
    Prescience: "You can view the top card of both players' Decks until the end of the 5th turn.",
    Endless_Trap_Hell: "Can be used when you have 3 trap cards in the Graveyard. 1 random Trap Card in your Graveyard is added to your hand. Then, shuffle 1 random Trap Card in your Graveyard into your Deck. This skill can only be used once per Duel.",
    Power_of_Dark: "Begins Duel with the Field Spell \"Yami\" activated.",
    Draw_Sense_SpellTrap: "Can be used each time your Life Points decrease by 1800. In the Draw Phase, instead of doing a normal draw, draw a random Spell/Trap card.",
    Sorcery_Conduit: "Can be used each time your Life Points decrase by 1800. In the Draw Phase, instead of doing a normal draw, draw a random Spellcaster-Type monster.",
    Destiny_Draw: "Can be used each time your Life Points decrease by 2000. In the Draw Phase, instead of doing a normal draw, draw the card of your choice.",
    Peak_Performance: "Begins Duel with the Field Spell \"Mountain\" activated.",
    Beatdown: "Boosts the ATK of face-up attack position monsters you control by 300 per level 5 or more monsters you control. You can only use the skill once per turn.",
    Draw_Sense_High_Level: "Can be used each time your Life Points decrase by 1800. In the Draw Phase, instead of doing a normal draw, draw a random level 7 or more monster.",
    Heavy_Starter: "If your Deck has 3 or more Level 5 or higher monsters with different names, you will have improved chance of having a Level 5 or higher monster in your starting hand.",
    LP_Boost_a: "Increases starting Life Points by 1000.",
    Grit: "The skill is activated randomly when your turn starts. Your Life Points does not get decreased to less than 1 until your opponent's next turn ends.",
    Roll_n_Boost: "Can be used each time your Life Points decrease by 2000. Show 1 monster card in your hand to the opponent and roll the die once. The Level of the monster shown becomes that of the die number untile the end of the turn.",
    Last_Gamble: "Can be used in your Main Phase, starting from the fifth turn. Upon activation, reduces your LP to 100 and discards 2 cards from your hand. You roll a die and draw that number of cards. This skill can only be used once per Duel.",
    Luck_on_Your_Side: "If your Life Points drop below 1000, your coin tosses always land on heads.",
    Holy_Guard: "You receive no battle damage during your turn.",
    LP_Boost_y: "Increases starting Life Points by 2500, reduces hand by 2 cards.",
    Life_Cost_0: "You can use the skill when your Life Points are 1000 or less. You do not have to spend Life Points to activate a card until your opponent's next turn ends. You can only use the skill once per Duel.",
    Surprise_Present: "Select 1 card Set in your Spell & Trap Zone, and force it on your opponent. Only the player that activates this skill can view this card. This skill can only be used once per Duel.",
    Duel_standby: "Gives 1 more card in each player's starting hand.",
    Aroma_Strategy: "You can see the card at the top of your deck even before drawing it.",
    LP_Boost_b: "Increases starting Life Points by 1500, reduces hand by 1 card.",
    Draw_Sense_WIND: "Can be used each time your Life Points decrase by 1500. In the Draw Phase, instead of doing a normal draw, draw a random Wind-Attribute monster.",
    Harpies_Last_Will: "6 \"Harpie\" cards in your Graveyard are banished, and 1 \"Harpie's Feather Duster\" card is added to your hand from outside your Deck.",
    Flight_of_the_Harpies: "Can be used each time your Life points decrease by 1800. In the Draw Phase, instead of doing a normal draw, draw a random \"Harpie\" card.",
    Harpies_Hunting_Ground: "Begin Duel with the Field Spell \"Harpies' Hunting Ground\" activated.",
    Insect_Uprising: "You can use the skill when you control 3 or more Insect-type monsters. Decreases the ATK of face-up attack position monsters your opponent controls by 800. You can only use the skill once per turn.",
    Draw_Sense_Low_Level: "Can be used each time your Life Points decrease by 1800. In the Draw Phase, istead of doing a normal draw, draw a level 1-4 monster card.",
    Parasite_Infestation: "Can be used after the starting hand is distributed. Shuffle random number of Parasite Paracide into your opponent's deck.",
    Buzz_On: "Can be used each time your Life Points derease by 1800. In the Draw Phase, instead of doing a normal draw, draw a random Insect-Type monster.",
    Moth_to_the_Flame: "Turn counts are double-speed for any \"Petit Moth\" with \"Cocoon of Evolution\" equipped on your side of the field.",
    Dinosaur_Kingdom: "Begin duel with the field spell \"Jurassic World\" activated.",
    Draw_Sense_High_Level: "Can be used each time your Life Points decrease by 1800. In the Draw Phase, instead of doing a normal draw, draw a random level 5 or more monster",
    Dino_Destruction: "Can be used if a Level 6 Dinosaur-Type monster is on your field. If that monster attacks a monster in a Defense Positin this turn, the opponent takes battle damage equal to the amount that ATK exceeds DEF. This skill can only be used once per turn.",
    Titan_Showdown: "Whichever player has doulbe or more LP than the other takes double battle damage.",
    Dinos_Find_a_Way: "Can be used each time your Life Points decrease by 1800. In the Draw Phase, instead of doing a normal draw, draw a random Dinosaur-Type monster.",
    Dino_Rampage: "Can be used each time your Life Points decrease by 1800, and you have a Dinosaur-Type normal monster on your field. That monster can attack twice during the Battle Phase, this turn. This skill can only be used once per turn.",
    Mythic_Depths: "Begins Duel with the Field Spell \"Umi\" activated.",
    Draw_Sense_WATER: "Can be used each time your Life Points decrase by 1500. In the Draw Phase, instead of doing a normal draw, draw a random Water-Attribute monster.",
    Balance: "Your starting hand will reflect the card balance of your deck.",
    Menace_from_the_Deep: "Can be used if \"Umi\" is on the field, and you have a Water-attribute normal monster on your field. That monster can attack your opponent directly. this turn. At the end of the Battle Phase, that monster is sent to the Graveyard. This skill can only be used once per turn.",
    Sleight_of_Hand: "Can be used each time your Life Points decrease by 1500. You add a 7 Completed, that is hidden behind your wristband, to your hand.",
    Restart: "Can be used after starting hand is distributed. Shuffle all the cards from your hand into the Deck. Then draw the starting hand again.",
    Baggy_Sleeves: "If one of yoour monsters of Level 5 or higher is destroyed in battle, in your next Draw Phase a normal draw gives you 2 cards.",
    Cheaters_Coin: "If your Life Points are at least 1000 more than opponent's, and if you have at least 5 cards in your hand, your coin tosses always land on heads.",
    Bandit: "Can be used if your Life Points are at 1500 or below. Select and take control of 1 card Set in your opponent's Spell & Trap Zone. This skill can only be used once per Duel",
    Chain_Reaction: "Can be used each time you activate a Trap card. Decreases your opponent's Life Points by 200.",
    Bluff_Trap: "Can be used each time your Life Points decrease by 1200. \"Statue of the Wicked\" is set in your Spell & Trap Zone.",
    Trap_Layer: "If your Deck contains 5 or more Trap Cards with different names, you will have improved chances of having a Trap Card in your starting hand.",
    Draw_Pass: "In the Draw Phase, instead of doing a normal draw, restores Life Points by 300. The skill can be used only three times per Duel.",
    Fairys_Smile: "If you normal draw a Fairy-Type monster card during the Draw Phase, the card is shown to the opponent and you recover 500 Life Points.",
    Precognition: "Can be used when your opponent's Life Points are more than twice your Life Points. You can see cards at the top of decks of both players.",
    Gravekeepers_lot: "Can be used each time your Life Points decrease by 1800. In the Draw Phase, instead of doing a normal draw, draw a random \"Gravekeeper's\" card.",
    No_Mortal_Can_Resist: "Can be used when your Life points are at least 1000 less than the opponent's. All monsters in the opponent's Graveyard changes to Skull Servants (Zombie / DARK / Level 1 / ATK: 300 / DEF: 200). This skill can only be used once per turn.",
    Sealed_Tombs: "Until the end of the opponent's next turn, neither you nor the opponent can Special Summon monsters from the Graveyard. This skill can only be used once per Duel.",
    Mind_Scan: "If your Life Points are 3000 or more, you can see the cards Set in your opponent's field.",
    Master_of_Rites: "Can be used each time your Life Points decrease by 1800. In the Draw Phase, instead of doing a normal draw, draw a random Ritual monster or spell card.",
    Its_a_Toon_World: "Begin Duel with the Continuous Spell \"Toon World\" activated.",
    Creator: "Can be used if your Life Points drop below 2000. In the Draw Phase, instead of doing a normal draw, a powerful card, from outside of your Deck, is added to your hand. This skill can only be used once per Duel.",
    Extra_Extra: "Can be used if your Life Points decrease by 2000. In the Draw Phase, a card you draw is duplicated."
};

var exports = module.exports = function DLSkills(bot) {
    this.setup = function () {
        bot.commands.add("!skill", function (args, message) {
            var sequenceMatcher = new difflib.SequenceMatcher(null, "", "");
            var request = args.join("_").toLowerCase();
            request = request.replace(/(,|'|!|:|\/)/g, "");
            sequenceMatcher.setSeq2(request);
            var match = "";
            var mratio = 0;
            Object.keys(DATA).map(function (key, index) {
                sequenceMatcher.setSeq1(key.toLowerCase());
                var ratio = sequenceMatcher.ratio();
                if (ratio >= MATCH_RATIO && ratio > mratio) {
                    match = key;
                    mratio = ratio;
                }
            });

            if (match !== "") {
                var output = {
                    type: "rich",
                    fields: [],
                    color: 0x40558B
                };

                var name;
                if (NAMES[match]) {
                    name = NAMES[match];
                } else {
                    name = match.replace(/_/g, " ");
                }
                output.author = {
                    name: name,
                    icon_url: "http://i.imgur.com/nKigv6X.png"
                };

                output.description = DATA[match];

                bot.sendMessage(message.channel, "", {
                    embed: output
                });
            }
        });
    }
};