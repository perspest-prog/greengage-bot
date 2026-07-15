import { Telegraf, session } from "telegraf";
import { inlineKeyboard, button } from "telegraf/markup";
import { SceneContext, Stage } from "telegraf/scenes";

import { calculate, order, question, answer, receipt, review } from "./scenes";
import getToken from "./utils/getToken";

const bot = new Telegraf<SceneContext>(getToken());
const scenes = new Stage([calculate, order, question as any, answer, receipt, review]);

bot.use(session());
bot.use(scenes.middleware());

bot.action("calc", Stage.enter("CalculateScene") as any);
bot.action("rates", Stage.enter("RatesScene") as any);

bot.action(/deny/, (ctx) => {
  const { id, price } = JSON.parse(ctx.match.input.split(" ").pop());

  ctx.scene.enter("ReviewScene", { id });
});
bot.action(/accept/, (ctx) => {
  const { id, price } = JSON.parse(ctx.match.input.split(" ").pop());
  ctx.telegram.sendMessage(
    id,
    "Твоя заявка была <b><i>одобрена</i></b> администратором!\n\n" +
      `Итого к оплате: <b>${price}₽</b>\n\n` +
      "Оплатите, пожалуйста, по:\n\n" +
      "• номеру карты 2200700829011724\n\n" +
      "• номеру телефона 89261921149\n\n" +
      "📦 <i>Доставка и оплачивается по прибытию товара на склад в Китае. Итоговая стоимость доставки может незначительно отличаться.</i>\n\n" +
      "• Нажмите кнопку <b><i>Заказ оплачен</i></b> после перевода суммы.",
    {
      parse_mode: "HTML",
      reply_markup: inlineKeyboard([button.callback("Заказ оплачен", "order_paid")]).reply_markup,
    }
  );
});

bot.action("order_paid", async (ctx) => {
  await ctx.reply(
    "Спасибо!\n" +
      "Вот твой чек.\n" +
      "Уведомлять о статусе заказа будет поддержка, но если что можешь обратиться к ней сам.",
    {
      parse_mode: "HTML",
    }
  );
  await ctx.telegram.sendMessage(
    -1002593649737,
    `Пользователь @${ctx.from.username} оплатил заказ.`,
    inlineKeyboard([button.callback("Отправить чек", "receipt " + ctx.from.id)])
  );
});

bot.action(/receipt/, (ctx) => {
  const chat_id = Number(ctx.match.input.split(" ").pop());
  ctx.scene.enter("ReceiptScene", { chat_id });
});

bot.action(/answer/, (ctx) => {
  const id = Number(ctx.match.input.split(" ").pop());
  ctx.scene.enter("AnswerScene", { user_id: id });
});

bot.action("lala", (ctx) => {
  ctx.reply(
    "Бежим-бежим!\n" +
      "Твое сообщение по ускорению процесса приема заявки было отправлено.\n" +
      "Если что-то важное, обращайся <b>в поддержку.</b>",
    {
      parse_mode: "HTML",
    }
  );
});

bot.start((ctx) => {
  ctx.replyWithPhoto(
    "AgACAgIAAxkBAANLaD3S-lfC8yocudAJ3n1r3J0O3OAAAgHwMRun0_BJEMDbPOr2WiMBAAMCAAN5AAM2BA",
    {
      caption:
        "📌 Это основное меню\n\n" +
        "Доступны такие услуги как:\n\n" +
        "Калькулятор\n" +
        "Связаться с поддержкой\n" +
        "Написать отзыв\n" +
        "Посмотреть отзывы\n\n" +
        "Также мы будем держать тебя в курсе самых свежих новостей и акций🔥",
      reply_markup: inlineKeyboard([
        [button.callback("Калькулятор", "calc")],
        [
          button.url("Отзывы", "https://t.me/greenfeedback"),
          button.url("Связаться с поддержкой", "https://t.me/greenmngr"),
        ],
      ]).reply_markup,
    }
  );
});

bot.on("message", (ctx) => {
  console.log(ctx.message);
});

bot.launch();
bot.telegram.sendMessage(1239731744, "awdawdawdawd");
bot.use((s, w) => {
  s.
})