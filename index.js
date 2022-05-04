const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const Instagram = require("instagram-web-api");
const FileCookieStore = require("tough-cookie-filestore2");
const cron = require("node-cron");

const { username, password } = require("./config.js");

const cookieStore = new FileCookieStore("./cookies.json");

const client = new Instagram({
    username,
    password,
    cookieStore,
});

const postShop = async () => {
    try {
        const { user, authenticated, status } = await client.login();

        // if (!user) {
        //     throw new Error(`User: ${username} not found`);
        // }

        if (!authenticated) {
            throw new Error(
                `Unable to authenticate user: ${username}, make sure you have 2FA disabled.`
            );
        }

        let profile = await client.getProfile();
        console.log(`Logged in as ${profile.username}`);

        const canvas = createCanvas(1000, 1000);
        const ctx = canvas.getContext("2d");
        const image = await loadImage("https://fishstickbot.com/api/shop.png");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        await fs.promises.writeFile("shop.jpeg", canvas.toBuffer("image/jpeg"));

        const { media } = await client.uploadPhoto({
            photo: "shop.jpeg",
            caption: `Latest Fortnite Item Shop ${new Date().toDateString()}\n\n#Fortnite #ItemShop #FortniteItemShop #BattleRoyale #FortniteShop #FortniteSkins #FreeSkins #EpicPartner`,
            post: "feed",
        });
        console.log(
            `Posted item shop: https://www.instagram.com/p/${media.code}`
        );
    } catch (e) {
        console.error(e);
    }
};

(async () => {
    console.log(`Setting up auto post job...`);
    cron.schedule(
        "1 0 * * *",
        async () => {
            console.log(`Posting item shop...`);
            await postShop();
            console.log(`Done!`);
        },
        {
            scheduled: true,
            timezone: "Etc/UTC",
        }
    );
    console.log(`Will post item shop every day at 0:00 UTC`);
})();
