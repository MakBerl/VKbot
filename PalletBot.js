//PalletBot0.9.1 by @makberl

const VkBot = require('node-vk-bot-api')
const { Client } = require('pg')
const token='';
const bot = new VkBot(token);
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const Scene = require('node-vk-bot-api/lib/scene');
const Markup = require('node-vk-bot-api/lib/markup');
const CheckerID=[53221438, 98079391];

const AdminID=[53221438 ,98079391];
//Подрубаем БД
//localDB
/*
client = new Client({
  host: '127.0.0.1',
  username: 'postgres',
  password: 'postgres',
  database: 'testdb',
  port:'5432',
});*/
//Raspberry
client = new Client({
  host: '127.0.0.1',
  username: 'pi',
  password: 'Adv555689',
  database: 'pallet',
  port:'5432',
});

client.connect();
//Защиту от угона сделай
//-----------------------
const UserTable='pallet';
const Insert='INSERT INTO '+UserTable+' (vk, first_name, second_name,phone,count) VALUES ($1,$2,$3,$4,0) RETURNING *';
const Connect='UPDATE '+UserTable+' SET vk=$1,first_name=$4, second_name=$5 WHERE phone=$2 AND card=$3 RETURNING *';
const Status='SELECT * FROM '+UserTable+' WHERE vk=$1';
const ForCheckPhone='SELECT * FROM '+UserTable+' WHERE phone=$1';
const SetCard='UPDATE '+UserTable+' SET card=table_id WHERE vk=$1 RETURNING *';
const AddToCount='UPDATE '+UserTable+' SET count=count + 1 WHERE vk=$1 RETURNING *';
const ForCheckCard='SELECT * FROM '+UserTable+' WHERE card=$1';//Для поиска по номеру карты или телефона
const DEL='DELETE FROM '+UserTable+' WHERE vk=$1'
const SET1='UPDATE '+UserTable+' SET ';
const SET2=' WHERE vk=$2 RETURNING *'
//-----------------------
const TransTable='transaction';
const AddReq='INSERT INTO '+TransTable+' (vk_from, vk_to, req_time) VALUES ($1,$2,to_timestamp($3)) RETURNING *';
const AddRes='UPDATE '+TransTable+' SET vk_to=$1,isconfirm=$2,res_time=to_timestamp($3) WHERE transaction_id=$4 RETURNING *';
const isconfirm='SELECT isconfirm FROM '+TransTable+' WHERE transaction_id=$1';
//-----------------------
let Klava=Markup.keyboard([[Markup.button('Статус', 'primary'), Markup.button('Запрос','positive')],[Markup.button('Информация','secondary')]]);
let WorkWithUsers=Markup.keyboard([[Markup.button('Поиск','secondary')],[Markup.button('Добавить Пользователя','positive')],[Markup.button('Изменить пользователя','primary')],[Markup.button('Удалить пользователя','negative')],[Markup.button('<--','secondary')]])
let EditKlava=Markup.keyboard([Markup.button('Имя','secondary'),Markup.button('Фамилию','secondary'),Markup.button('Телефон','secondary'),Markup.button('Номер карты','secondary'),Markup.button('Count','secondary'),])
let DelKlava=Markup.keyboard([Markup.button('Отмена','secondary'),Markup.button('Удалить','negative')]);
let YesNoKlava=Markup.keyboard([Markup.button('Нет','negative'),Markup.button('Да','positive')]);
let RegKlava=Markup.keyboard([[Markup.button('Регистрация', 'primary')],[Markup.button('Информация','secondary')]]);
let EmptyKlava=Markup.keyboard([]);
let AdminKlava=Markup.keyboard([[Markup.button('+1 по карте','primary')],
[Markup.button('+1 по телефону','primary')],[Markup.button('EXCEL EXPORT','negative')],
[Markup.button('Работа с пользователями','secondary')]])
let Exit='Выход';
let ExitMessage='Выходим...'

let CountPhoto=['photo-74721933_457239022','photo-74721933_457239023','photo-74721933_457239024','photo-74721933_457239025','photo-74721933_457239026','photo-74721933_457239027','photo-74721933_457239028','photo-74721933_457239018','photo-74721933_457239019','photo-74721933_457239020','photo-74721933_457239021']//Массив фоточек в левом альбоме
let PodMes=[
'Пора начать этот весёлый марафон к бесплатному кальяну!',
'Хорошее начало, но впереди еще много интересного!',
'Надеюсь, тебе нравиться этот экспириенс! Погнали дальше!',
'Вроде так мало, но сколько вкусного ты уже попробовал)',
'Всего чуть-чуть до середины!',
'Половина пути уже пройдена! Продолжаем в том же духе!',
'После 5 кальянов все идет намного легче, не так ли?',
'Судя по количеству кальянов, ты уже почти Гуру! Не останавливайся!',
'Ты уже на финишной прямой! Поднажмем!',
'Всего 1 кальян и ты победил!',
'Это было сложно, но весело. При следующем посещении тебя будет ждать твой приз - бесплатный кальян!'];

let info_mes=`Привет, мы находимся по адресу: г.Выкса, ул.Островского, д62 \n    График работы: 18:00-02:00 \n Телефон для связи и бронирования: +79108767440`;

bot.command(['/start','Начать'], (ctx) => {
  if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
    ctx.reply('Здарова, вот твоя админская клава',null,AdminKlava)
  }
  else
{client.query(Status,[ctx.message.from_id],(err,res)=>
{
  if(!err)
  {
    if(res.rows[0])
    {
      ctx.reply('Вы уже загеристированы!',null,Klava)
    }
    else
    ctx.reply('Здравствуйте, пожалуйста зарегистрируйтесь для получения виртуальной карты',null,RegKlava)
  }
})}
})
//Пох на это
bot.command(['Статус','/status'],(ctx)=>{ 
  if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
    //console.log('Ты админ')
    ctx.reply('Вот твоя админская клава',null,AdminKlava)
  }
  else{
    //console.log('Ты не админ')
  client.query(Status,[ctx.message.from_id],(err,res)=>{
    //console.log(err);
    //console.log(res.rows);
    if(!err)
    {
      if (res.rows[0])
      {
        let padezh;
        if(res.rows[0].count==1)
        padezh='наклейка'
        else if(res.rows[0].count>1 && res.rows[0].count<5)
        padezh='наклейки'
        else 
        padezh='наклеек'
       // console.log('Побывал здесь')
        ctx.reply(`На вашей карточке №${res.rows[0].card} сейчас ${res.rows[0].count} `+padezh+`. `+PodMes[res.rows[0].count], CountPhoto[res.rows[0].count], Klava)
        /*ctx.reply(`По этому id: ${ctx.message.from_id} найдено:
        VK_id: ${res.rows[0].vk}
        Имя: ${res.rows[0].first_name}
        Телефон: ${res.rows[0].phone}
        Номер карты: ${res.rows[0].card}
        Кол-во каликов: ${res.rows[0].count}`,CountPhoto[res.rows[0].count],Klava)*/
      }
      else
        ctx.reply('Ты не зареган!\nНажми на кнопку "Регистрация" чтобы зарегистрироваться',null, RegKlava);
        //-----------------------------------
        //Вставь либо инлайн либо клаву снизу
        //-----------------------------------
    }
    else 
      ctx.reply('Error')
      
  })
  }

  
  })

bot.command('test',(ctx)=>{
  ctx.reply('test')
})

//ПАСХАЛКА
bot.command(['/что', 'Что','что'],(ctx)=>{
  //Тут ищем в БД и в зависомости от 
  if(ctx.message.from_id=='53221438')
  {
  ctx.reply(`Ничего<3`);
  bot.sendMessage('118172430','<3')
  }
  else if (ctx.message.from_id=='118172430')
  {
    ctx.reply(`Ничего<3`);
    bot.sendMessage('53221438','<3')
  }
  })



  //Добавь проверку vk_id на наличие в БД Checked
//Регистрация///////////////////////////////////
  let regexp=/[0-9a-z]/i;
  let regexp2=/[^0-9]/;
const session = new Session();
const reg = new Scene('register',
  (ctx) => {
    if (ctx.message.text==Exit)
    {
      ctx.scene.leave();
      ctx.reply(ExitMessage,null,RegKlava);
    }
else
{
    //console.log(ctx.message.text)
if(!regexp2.test(ctx.message.text))//Если цифры значит нам кинули айдишник(Админ), тогда присваиваем
    ctx.session.vk=ctx.message.text
else//Иначе пользователь регается, тогда берем id из сообщения
    ctx.session.vk=ctx.message.from_id;
    //console.log(ctx.session.vk)

    ctx.scene.next();
    ctx.reply('Начнём со знакомства! Какое у тебя имя?',null,EmptyKlava);
}},
  (ctx) => {
    if (ctx.message.text==Exit)
    {
      ctx.scene.leave();
      ctx.reply(ExitMessage,null,RegKlava);
    }
    else
    {
    if(regexp.test(ctx.message.text))//Если есть хотя бы 1 англ буква
    ctx.reply('Некорректно введены данные, попробуй еще раз:')
    else
    {
      ctx.session.first_name=ctx.message.text;
      ctx.scene.next();
      ctx.reply('Введите вашу фамилию:');
    }
  }},
  (ctx) => {
    if (ctx.message.text==Exit)
    {
      ctx.scene.leave();
      ctx.reply(ExitMessage,null,RegKlava);
    }
    else
    {


    if(regexp.test(ctx.message.text))//Если есть хотя бы 1 англ буква
    ctx.reply('Некорректно введены данные, попробуй еще раз:')
    else
    {
      ctx.session.second_name=ctx.message.text;
      ctx.scene.next();
      ctx.reply('А теперь напиши свой номер телефона, чтобы мы могли связаться с тобой даже если ты оффлайн!');
    }
  }},
  (ctx) => {//Тут ВВОД НОМЕРА ТЕЛЕФОНА, СРАЗУ ИЩИ ЕГО В БД, ЕСЛИ ЕСТЬ, ТО СПРАШИВАЙ НОМЕР КАРТЫ=>СРАВНИВАЙ И ПРИВЯЗЫВАЙ
    if (ctx.message.text==Exit)
{
  ctx.scene.leave();
  ctx.reply(ExitMessage,null,RegKlava);
}
else
{
    //-----------РАБОТА С НОМЕРОМ ТЕЛЕФОНА И  ПРИВЕДЕДЕНИЕ ЕГО В НОРМАЛЬНЫЙ ВИД
    let phone=ctx.message.text;
    phone=phone.replace(/-/g,'');
    phone=phone.replace(/\s/g,'');
    phone=phone.replace('+7','8');
    if(phone[0]=='8')
      phone=phone.replace('8','')
    //-----------ВРОДЕ НОРМ РАБОТАЕТ
      //Если есть хотя бы 1 символ кроме цифр(Улучши проверку)
      //console.log(phone.length)
      //console.log(phone[0])
      //console.log(!regexp2.test(phone))
    if(phone.length==10 && phone[0]=='9' && !regexp2.test(phone))
    {

      ctx.session.phone=phone;
      client.query(ForCheckPhone,[ctx.session.phone],(err,result)=>{
        //console.log(result.rows[0]);
        if (result.rows[0])
        {
          if(result.rows[0].vk==null)
          {ctx.scene.next()//Проверка vk_id на null(Иначе пользователи могут перепривязывать карту к разным id)
          ctx.reply('Похоже ваш номер телефона уже есть в нашей базе, введите номер карты, для привязки вашего аккаунта:')}
          else
          {
            ctx.scene.leave()
            ctx.reply('К этому номеру телефона уже привязан VK пользователю',null,RegKlava)
          }
        }
        else
        {
          ctx.scene.leave();
          client.query(Insert,[ctx.session.vk,ctx.session.first_name,ctx.session.second_name,ctx.session.phone],
            (err,res)=>{//Добавили пользователя и пытаемся присвоить ему карту
              if(!err)
              {client.query(SetCard,[ctx.session.vk],(err,res)=>{//
                if(res.rows[0])
                {
                  //console.log(res.rows[0])
                  ctx.reply(`Готово! Номер вашей карточки ${res.rows[0].card}! Запомни ее номер. По нему мы всегда тебя узнаем! Осталось только собрать наклейки и бесплатный кальян твой!`,null,Klava)
                  /*
                  ctx.reply(`Спасибо за регу!
                  VK_id: ${res.rows[0].vk}
                  Имя: ${res.rows[0].first_name}
                  Телефон: ${res.rows[0].phone}
                  Номер карты: ${res.rows[0].card}
                  Кол-во каликов: ${res.rows[0].count}`,null,Klava)
                  */
                  //----------------------------------------------
                  //Добавь клаву с кнопками статус и подтверждения
                  //----------------------------------------------
                }
              })}
              else
              ctx.reply('Ошибка при обращении к БД')

              
              //SET CARD NUMBER

          })
          /*
          ctx.reply(`Уважаемый ${ctx.session.name}, спасибо за регистрацию!
        Ваш номер телефона: ${ctx.session.phone};
        Вам выдана карта с номером(тут поиск по БД с помощью номера телефона);
        Кол-во заказанный кальянов:(тут функция поиска??? тоже поиск);
        Хорошего вам времени суток!`);
        */
        }
        })//if doesnt exist then leave and add else find him? take his card, ask him for card, compare, then connect
    //В итоге всю инфу вкатываем в бд
    
    //console.log(ctx.session)
}
    else 
      ctx.reply('"Это не похоже на номер телефона! Попробуйте заново!')
  }},
  (ctx)=>{//Функция привязки
    if (ctx.message.text==Exit)
{
  ctx.scene.leave();
  ctx.reply(ExitMessage,null,RegKlava);
}
else
{
    
    
    ctx.session.card=ctx.message.text;
    if (regexp2.test(ctx.message.text))
    ctx.reply('Нужны цифры, Мейсон!!!')
    else 
    client.query(Connect,[ctx.session.vk, ctx.session.phone, ctx.session.card,ctx.session.first_name,ctx.session.second_name],(err,res)=>{//Падает из-за smallint
      if(!err)
      {
        if(res.rows[0])
        {
          ctx.reply('Успешно привязано',null,Klava)//Добавь клаву с кнопками статус и подтверждение
          ctx.scene.leave();
        }
        else
        {
          ctx.reply('Что-то пошло не так, введите номер карты еще раз.')
        }
      }
      else//Костыль
      ctx.reply('Что-то пошло не так, введите номер карты еще раз.')
      
    })
  }});
//////////////////////////////////////


//Увеличение админом каликов///////////////////////
  //В историю записывай, плиз
const add_to_count_scene=new Scene('add_to_count',(ctx)=>{
if (ctx.message.text==Exit)
{
  ctx.scene.leave();
  ctx.reply(ExitMessage,null,RegKlava);
}
else
{
  //console.log(ctx.session.isdel)
  if (ctx.message.text=='+1 по карте')
    {ctx.session.mode=0;//Ставим режим, если 0 то по карте, если 1 то по номеру телефона
    ctx.reply('Введите номер карты',null,EmptyKlava)}
  if (ctx.message.text=='+1 по телефону')
    {ctx.session.mode=1;//
    ctx.reply('Введите номер телефона',null,EmptyKlava)}
  ctx.scene.next()
}
},
(ctx)=>{//Тут нам ввели номер телефона и мы смотрим инфу
  if (ctx.message.text==Exit)
  {
    
    ctx.scene.leave();
    ctx.reply(ExitMessage,null,AdminKlava);
  }
  else//^^^Выход из сцены:^^^
  {
    ctx.session.numbers=ctx.message.text

    function ShowInfo(err,res){
      if(!err)
      {

        //console.log(res.rows[0])
        if(res.rows[0])
        {
        ctx.session.addtouser=res.rows[0]
        ctx.scene.next();
        ctx.reply(`Ему?
        VK_id: ${res.rows[0].vk}
        Имя: ${res.rows[0].first_name}
        Телефон: ${res.rows[0].phone}
        Номер карты: ${res.rows[0].card}
        Кол-во каликов: ${res.rows[0].count}`,null,YesNoKlava)}
        else
        ctx.reply('Не найдено, введите другой номер')
      }
      else 
      ctx.reply('error')
    }
  
    if (ctx.session.mode==0)//По карте
    {
      
      ctx.session.numbers=ctx.session.numbers.replace(/\s/g,'')
      if(!regexp2.test(ctx.session.numbers))
      {
      //console.log('Перед обращением к бд')
      //console.log(ctx.session.numbers)
      client.query(ForCheckCard,[ctx.session.numbers],ShowInfo)
      }
      else
        ctx.reply('Неверно введен номер карты. Введите номер карты правильно')
    }
    else if(ctx.session.mode==1)//По мобиле
    {
      let phone=ctx.session.numbers;
      phone=phone.replace(/-/g,'');
      phone=phone.replace(/\s/g,'');
      phone=phone.replace('+7','8');
      if(phone[0]=='8')
        phone=phone.replace('8','')
      //-----------ВРОДЕ НОРМ РАБОТАЕТ
        //Если есть хотя бы 1 символ кроме цифр(Улучши проверку)
      if(phone.length==10 && phone[0]=='9' && !regexp2.test(phone))
      {
      ctx.session.numbers=phone;
      client.query(ForCheckPhone,[ctx.session.numbers],ShowInfo)
      }
      else
        ctx.reply('Неверно введен номер телефона. Введи номер телефона правильно')
    }
  }
},
(ctx)=>{//Теперь у нас есть инфа об этом челе, теперь добавляем ему и отправляем сообщение
  if (ctx.message.text==Exit)
  {
    ctx.scene.leave();
    ctx.reply(ExitMessage,null,AdminKlava);
  }
  else//^^^Выход из сцены:^^^
  {
    if (ctx.message.text=='Нет')
    {
      ctx.scene.leave();
      ctx.reply(ExitMessage,null,AdminKlava);
    }
    else if(ctx.message.text=='Да')
    {
      
      client.query(AddToCount,[ctx.session.addtouser.vk],(err,res)=>{
        if(!err)
        {
          if(res.rows[0])
          {ctx.reply('Добавил ему',null,AdminKlava)//Empty ли, ведь это админская хуйня
          bot.sendMessage(res.rows[0].vk,`Вам подтвердили кальян, теперь их у вас ${res.rows[0].count}`)
          //Мб картиночку потом прифигачит:^^^
        ctx.scene.leave();
        }
          else
          ctx.reply('Нет результата')

          //Ну можешь еще картиночку добавить
        }
        else 
          ctx.reply('Ошибка при работе с БД')
      })


      if(ctx.session.mode==0)//По карте
      {

      }
      else if(ctx.session.mode==1)//По телефону
      {

      }
    }
    
  }
});


//Добавление пользователя админом////////
const add_user_scene=new Scene('add_user',
(ctx)=>{
  if (ctx.message.text==Exit)
  {
    ctx.scene.leave();
    ctx.reply(ExitMessage,null,AdminKlava);
  }
  else{
  ctx.reply('Введи VKid (цифрами) для добавления нового пользователя',null,EmptyKlava)
  ctx.scene.next();
  }
},
(ctx)=>
{//тут ввели id
  if (ctx.message.text==Exit)
  {
    ctx.scene.leave();
    ctx.reply(ExitMessage,null,AdminKlava);
  }
else{
  if(!regexp2.test(ctx.message.text))//Если нет ни одной не цифры
  //Проверь не зареган ли он уже
    {
      client.query(Status,[ctx.message.text],(err,res)=>{
        if(!err)
        {
          if(!res.rows[0])
          {
            ctx.scene.leave();
            ctx.scene.enter('register');
          }
          else
          {
            ctx.reply('Этот id уже зареган',null,AdminKlava)
            ctx.scene.leave()
          }
          
        }
        else
          ctx.reply('Ошибка при обращении к БД')
      }
      )
    }
  else
  ctx.reply('Цифры, дружок')
}
})


//Изменение/Удаление пользователя
const edit_del_scene=new Scene('edit_del',
(ctx)=>{
  if (ctx.message.text==Exit)
  {
    ctx.scene.leave();
    ctx.reply(ExitMessage,null,AdminKlava);
  }
  else
  {
    ctx.scene.next();
    ctx.reply('Ищем по..',null,Markup.keyboard(['по карте','по телефону']))
  }
},
(ctx)=>{
  if (ctx.message.text==Exit)
  {
    ctx.scene.leave();
    ctx.reply(ExitMessage,null,AdminKlava);
  }
  else
  {
    //console.log(ctx.session.isdel)
  if (ctx.message.text=='по карте')
    {ctx.session.mode=0;//Ставим режим, если 0 то по карте, если 1 то по номеру телефона
    ctx.reply('Введите номер карты',null,EmptyKlava)}
  if (ctx.message.text=='по телефону')
    {ctx.session.mode=1;//
    ctx.reply('Введите номер телефона',null,EmptyKlava)}
  ctx.scene.next()
  }
},(ctx)=>{
  if (ctx.message.text==Exit)
  {
    ctx.scene.leave();
    ctx.reply(ExitMessage,null,AdminKlava);
  }
  else//^^^Выход из сцены:^^^
  {
    ctx.session.numbers=ctx.message.text

    function ShowInfo(err,res){
      if(!err)
      {
        //console.log(res.rows[0])
        if(res.rows[0])
        {
        ctx.session.addtouser=res.rows[0]
        ctx.scene.next();
        ctx.reply(`
        VK_id: ${res.rows[0].vk}
        Имя: ${res.rows[0].first_name}
        Фамилия: ${res.rows[0].second_name}
        Телефон: ${res.rows[0].phone}
        Номер карты: ${res.rows[0].card}
        Кол-во каликов: ${res.rows[0].count}
        Он?`,null,YesNoKlava)}
        else
        ctx.reply('Не найдено, введите другой номер')
      }
      else 
      ctx.reply('error')
    }
  
    if (ctx.session.mode==0)//По карте
    {
      ctx.session.numbers=ctx.session.numbers.replace(/\s/g,'')
      //console.log('Перед обращением к бд')
      //console.log(ctx.session.numbers)
      client.query(ForCheckCard,[ctx.session.numbers],ShowInfo)
    }
    else if(ctx.session.mode==1)//По мобиле
    {
      let phone=ctx.session.numbers;
      phone=phone.replace(/-/g,'');
      phone=phone.replace(/\s/g,'');
      phone=phone.replace('+7','8');
      if(phone[0]=='8')
        phone=phone.replace('8','')
      //-----------ВРОДЕ НОРМ РАБОТАЕТ
        //Если есть хотя бы 1 символ кроме цифр(Улучши проверку)
      if(phone.length==10 && phone[0]=='9' && !regexp2.test(phone))
      {
      ctx.session.numbers=phone;
      client.query(ForCheckPhone,[ctx.session.numbers],ShowInfo)
      }
      else
        ctx.reply('Неверно введен номер телефона. Введи номер телефона правильно')
    }
  }
}, (ctx)=>{//Спрашиваем о точном удалении или о том что хотим изменить
  if (ctx.message.text==Exit)
  {
    ctx.scene.leave();
    ctx.reply(ExitMessage,null,AdminKlava);
  }
  else//^^^Выход из сцены:^^^
  {
    if (ctx.message.text=='Нет')//Ну если нет, то вылазаем
    {
      ctx.scene.leave();
      ctx.reply(ExitMessage,null,AdminKlava);
    }
    else if(ctx.message.text=='Да')
    {
      if(ctx.session.isdel==1)//Погнали удалять
      {
        ctx.scene.next()
        ctx.reply('Вы точно хотите его удалить?',null,DelKlava)
      }
      else if(ctx.session.isdel==0)//go edit
      {
        ctx.scene.next()
        ctx.reply('Что вы хотите изменить?',null,EditKlava)
      }
    }
  }

},(ctx)=>{//Просим ввести на что изменяем ну и в одном варианте отчитываемся об удалении
  if (ctx.message.text==Exit)
  {
    ctx.scene.leave();
    ctx.reply(ExitMessage,null,AdminKlava);
  }
  else//^^^Выход из сцены:^^^
  {
    if(ctx.message.text=='Отмена')
    {
      ctx.scene.leave();
      ctx.reply(ExitMessage,null,AdminKlava);
    }
    else if(ctx.message.text=='Удалить')
    {
      client.query(DEL,[ctx.session.addtouser.vk],(err,res)=>{
        if(!err)
        {
          ctx.reply('Удалено',null,AdminKlava)
          ctx.scene.leave();
        }
        else
          ctx.reply('Ошибка при обращении к БД')
      })
    }
    else//А давай строку йобнем
    {
      if(ctx.message.text=='Имя')
        {
          ctx.session.edit_mode=0
          ctx.scene.next()
          ctx.reply('Введите новое '+ctx.message.text,null,EmptyKlava)
        }
      else if(ctx.message.text=='Фамилию')
        {
          ctx.session.edit_mode=1
          ctx.scene.next()
          ctx.reply('Введите новую '+ctx.message.text,null,EmptyKlava)
        }
      else if(ctx.message.text=='Телефон')
        {
          ctx.session.edit_mode=2
          ctx.scene.next()
          ctx.reply('Введите новый '+ctx.message.text,null,EmptyKlava)
        }
      else if(ctx.message.text=='Номер Карты')
        {
          ctx.session.edit_mode=3
          ctx.scene.next()
          ctx.reply('Введите новый '+ctx.message.text,null,EmptyKlava)
        }
      else if(ctx.message.text=='Count')
      {
        ctx.session.edit_mode=4;
        ctx.scene.next();
        ctx.reply('Введите новое значение '+ctx.message.text,null,EmptyKlava)
      }
      else
      ctx.reply('Выбери уже что-нибудь)')
    }
  }
},(ctx)=>{//Меняем значение и говорим об этом
  if (ctx.message.text==Exit)
  {
    ctx.scene.leave();
    ctx.reply(ExitMessage,null,AdminKlava);
  }
  else//^^^Выход из сцены:^^^
  {
    let edit_mode=ctx.session.edit_mode;
    let check=0;
    let WHATSET;
    let VALUE=ctx.message.text;
    if(edit_mode==0)//Имя
    {
      if(regexp.test(VALUE))//Если есть хотя бы 1 англ буква
      ctx.reply('Неверно введено имя, попробуй еще раз:')
      else
      { 
        WHATSET='first_name'
        check=1;
      }
    }
    else if(edit_mode==1)//Фамилия
    {
      if(regexp.test(VALUE))//Если есть хотя бы 1 англ буква
      ctx.reply('Неверно введена фамилия, попробуй еще раз:')
      else
      { 
        WHATSET='second_name'
        check=1;
      }
    }
    else if(edit_mode==2)//Номер телефона
    {
      let phone=ctx.message.text;
      phone=phone.replace(/-/g,'');
      phone=phone.replace(/\s/g,'');
      phone=phone.replace('+7','8');
      if(phone[0]=='8')
        phone=phone.replace('8','')
      //-----------ВРОДЕ НОРМ РАБОТАЕТ
        //Если есть хотя бы 1 символ кроме цифр(Улучши проверку)
        //console.log(phone.length)
        //console.log(phone[0])
        //console.log(!regexp2.test(phone))
      if(phone.length==10 && phone[0]=='9' && !regexp2.test(phone))
      {
        WHATSET='phone'
        VALUE=phone;
        check=1;
      }
      else
      ctx.reply('Некорректно введен номер телефона.Попробуй еще раз:')
    }
    else if(edit_mode==3)//Номер карты
    {

      if(!regexp2.test(VALUE))//Если цифры
      {
        client.query(ForCheckCard,[VALUE],(err,res)=>{
          if(!err)
          {
            if(!res,rows[0])
            {
              WHATSET='card'
              //console.log('Номер не занят')
              check=1;
            }
            else
            ctx.reply('К сожалению номер уже занят')
          }
          else
          ctx.reply('Ошибка при обращении к БД')
        })
      }
      else
      ctx.reply('Неверно введен номер карты. Введите номер карты правильно')
    }
    else if(edit_mode==4)//Count
    {
      VALUE=VALUE.replace(/\s/g,'')
      if (!regexp2.test(VALUE))
      {
        WHATSET='count'
        check=1;
      }
      else
      ctx.reply('Мне нужны цифры')
    }
    else//IMPOSSIBLE
      ctx.reply('Как ты сюда попал')

    if(check==1)
    {
      let stroka=SET1+WHATSET+'=$1'+SET2;
      //console.log(stroka)
      //console.log()
      client.query(SET1+WHATSET+'=$1'+SET2,[VALUE,ctx.session.addtouser.vk],(err,res)=>{
        if(!err){
            if(res.rows[0])
            {
              ctx.scene.leave();
              ctx.reply(`Обновил, теперь он такой:
              VK_id: ${res.rows[0].vk}
              Имя: ${res.rows[0].first_name}
              Фамилия: ${res.rows[0].second_name}
              Телефон: ${res.rows[0].phone}
              Номер карты: ${res.rows[0].card}
              Кол-во каликов: ${res.rows[0].count}`,null,AdminKlava)
            }
            else
            {ctx.reply('хз что в этой ситуации делать')
            ctx.scene.leave()}
        }
        else
        ctx.reply('Ошибка при обращении к БД')
      })
    }
  }
})

const search_scene=new Scene('search',
(ctx)=>{
  if (ctx.message.text==Exit)
  {
    ctx.scene.leave();
    ctx.reply(ExitMessage,null,AdminKlava);
  }
  else
  {
    ctx.scene.next()
    ctx.reply('Ищем по..',null,Markup.keyboard(['по карте','по телефону']))
  }
},
(ctx)=>{
  if (ctx.message.text==Exit)
  {
    ctx.scene.leave();
    ctx.reply(ExitMessage,null,AdminKlava);
  }
  else
  {
    if (ctx.message.text=='по карте')
    {ctx.session.mode=0;//Ставим режим, если 0 то по карте, если 1 то по номеру телефона
    ctx.reply('Введите номер карты',null,EmptyKlava)}
  if (ctx.message.text=='по телефону')
    {ctx.session.mode=1;//
    ctx.reply('Введите номер телефона',null,EmptyKlava)}
  ctx.scene.next()
  }
},
(ctx)=>{
  if (ctx.message.text==Exit)
  {
    ctx.scene.leave();
    ctx.reply(ExitMessage,null,AdminKlava);
  }
  else//^^^Выход из сцены:^^^
  {
    ctx.session.numbers=ctx.message.text

    function ShowInfo(err,res){
      if(!err)
      {
        //console.log(res.rows[0])
        if(res.rows[0])
        {
        ctx.session.addtouser=res.rows[0]
        ctx.scene.leave();
        ctx.reply(`
        VK_id: ${res.rows[0].vk}
        Имя: ${res.rows[0].first_name}
        Фамилия: ${res.rows[0].second_name}
        Телефон: ${res.rows[0].phone}
        Номер карты: ${res.rows[0].card}
        Кол-во каликов: ${res.rows[0].count}`,null,AdminKlava)}
        else
        ctx.reply('Не найдено, введите другой номер')
      }
      else 
      ctx.reply('error')
    }
  
    if (ctx.session.mode==0)//По карте
    {
      ctx.session.numbers=ctx.session.numbers.replace(/\s/g,'')
      //console.log('Перед обращением к бд')
      //console.log(ctx.session.numbers)
      client.query(ForCheckCard,[ctx.session.numbers],ShowInfo)
    }
    else if(ctx.session.mode==1)//По мобиле
    {
      let phone=ctx.session.numbers;
      phone=phone.replace(/-/g,'');
      phone=phone.replace(/\s/g,'');
      phone=phone.replace('+7','8');
      if(phone[0]=='8')
        phone=phone.replace('8','')
      //-----------ВРОДЕ НОРМ РАБОТАЕТ
        //Если есть хотя бы 1 символ кроме цифр(Улучши проверку)
      if(phone.length==10 && phone[0]=='9' && !regexp2.test(phone))
      {
      ctx.session.numbers=phone;
      client.query(ForCheckPhone,[ctx.session.numbers],ShowInfo)
      }
      else
        ctx.reply('Неверно введен номер телефона. Введи номер телефона правильно')
    }

  }

}
)

//Важная хрень для работы сцен
const stage = new Stage(reg,add_to_count_scene,add_user_scene,edit_del_scene,search_scene);
bot.use(session.middleware());
bot.use(stage.middleware());

//КОМАНДЫ/////////////////////////////////////
bot.command(['/reg','Регистрация'], (ctx) => {
  client.query(Status,[ctx.message.from_id],(err,res)=>{//Нужно для клавиатур
      if(!err){                                         //
      if(res.rows[0])
      ctx.reply('Ты уже зарегистрирован',null,Klava)
      else
      ctx.scene.enter('register');
    }
    else
    ctx.reply('Ошибка')
  })
});

bot.command('/admin',(ctx)=>{
  if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
    ctx.reply('Hello admin',null, AdminKlava)
  }
  else
    ctx.reply('У вас недостаточно прав')
})

bot.command(['/confirm','Запрос','/request'], (ctx)=>{
  //console.log(ctx.message.date)
  client.query(Status,[ctx.message.from_id],(err,res)=>{
    if(!err)
    {//Проверку на регистрацию
      client.query(AddReq,[ctx.message.from_id, CheckerID[0], ctx.message.date],(err1,res1)=>{
        if(!err1)
        {

          let message=`Запрос на подтверждение!
          Дата запроса: ${res1.rows[0].req_time}
          id запроса: ${res1.rows[0].transaction_id}
          Имя: ${res.rows[0].first_name} ${res.rows[0].second_name}
          Тел: ${res.rows[0].phone}
          Номер карты: ${res.rows[0].card}; Счет: ${res.rows[0].count}
          Подтвердить?
        `;
        //console.log(message);
        //Тут отправляем Андрею письмо с клавой и ответом (Да(id)/Нет(id))
          let No=Markup.button(`Нет #${res1.rows[0].transaction_id}`, 'negative');
          let Yes= Markup.button(`Да #${res1.rows[0].transaction_id}`, 'positive');
        ctx.reply('Сейчас мы сверимся с нашими данными и ответим тебе!')
        bot.sendMessage(CheckerID, message, null, Markup
          .keyboard([
            No,
            Yes,
          ])
          .inline())
      }
      else
      {
        //console.log(err1)
      ctx.reply('Ошибка добавления запроса')
      }
    })
  }
  else
  ctx.reply('Ошибка поиска пользователя в БД')
  
})


//Создать доп таблицу транзакций и оттуда брать id транзакции

})

bot.command('+1 по карте',(ctx)=>
{
  if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
  ctx.scene.enter('add_to_count')
  }
  else
    ctx.reply('У вас недостаточно прав')
  //
})
bot.command('+1 по телефону',(ctx)=>
{
  //AdminChecker HERE!!!!!!!
  if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
  ctx.scene.enter('add_to_count')
  }
  else
    ctx.reply('У вас недостаточно прав')
})
bot.command('Работа с пользователями',(ctx)=>{
  if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
  ctx.reply('Что вы хотите сделать?',null,WorkWithUsers)
  }
  else
    ctx.reply('У вас недостаточно прав')
})

bot.command('Добавить пользователя',(ctx)=>{
  //AdminChecker HERE!!!!!!!
  if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
  ctx.scene.enter('add_user')
  }
  else
    ctx.reply('У вас недостаточно прав')
})
bot.command('Удалить пользователя',(ctx)=>{

  //AdminChecker HERE!!!
  if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
  ctx.session.isdel=1;
  ctx.scene.enter('edit_del')
  }
  else
    ctx.reply('У вас недостаточно прав')
})
bot.command('Изменить пользователя',(ctx)=>{

  //AdminChecker HERE!!!
  if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
  ctx.session.isdel=0;
  ctx.scene.enter('edit_del')
  }
  else
    ctx.reply('У вас недостаточно прав')
})
bot.command('<--',(ctx)=>{
  //AdminChecker
  if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
  ctx.reply('Назаааад',null,AdminKlava)
  }
  else
    ctx.reply('У вас недостаточно прав')
})


bot.command(['/info','Информация'],(ctx)=>{
  if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
  ctx.reply(info_mes,null,AdminKlava)
  }
  else
  ctx.reply(info_mes,null,Klava)
  //console.log(ctx.session)
})


bot.command('/',(ctx)=>{
  ctx.reply('/admin - Вызов админской клавиатуры\n /info - Вызов информации о заведении\n /reg - \n /status - вывод статуса \n /request - Отправка запроса проверяющему \n /start - Вывод приветсвующей инфы \n /search - поиск пользователя \n Выход - команда для выхода из любой сцены')
})
bot.command(['Поиск','Search','/search'],(ctx)=>{
  if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
  //enter to scene
  ctx.scene.enter('search')
  }
  else
    ctx.reply('У вас недостаточно прав')
})
function Excel (ctx)
{ctx.reply('kek')}

bot.command(['/xls','xls','excel'],Excel)

bot.command('/edit',(ctx)=>{
  //Проверка на админа

})

bot.on((ctx) => {
  //console.log(ctx.message.text.match(/Да #\d/g));
  //console.log(ctx.message.text.replace(/Да #/g,''));
  //console.log(ctx.message.text.match(/Нет #\d/g))
  

  //Проверка на админа вcтавь
  if(CheckerID.indexOf(ctx.message.from_id) !== -1)
    {
      //console.log('Чекер написал '+ctx.message.from_id)
  if(ctx.message.text.match(/Да #\d/g)!=null)//Ответили "ДА"
  {
    let TransID=ctx.message.text.replace(/Да #/g,'')
    client.query(isconfirm,[TransID],(err0,res0)=>{
      if(!err0){
        if(res0.rows[0].isconfirm!=null)
          ctx.reply('Ээээ нельзя перезаписывать')
        else{
    client.query(AddRes,[ctx.message.from_id, 1,ctx.message.date,TransID],(err,res)=>{
      if(!err)
      {
        //console.log('Начинаю делать второй запрос')
        //console.log(res.rows[0].vk_from);
      client.query(AddToCount,[res.rows[0].vk_from],(err1,res1)=>{

        if(!err1)
        {
          bot.sendMessage(res1.rows[0].vk,`Все сошлось! Новая наклеечка уже на месте`,CountPhoto[res1.rows[0].count],Klava)
        //bot.sendMessage(res1.rows[0].vk,`Подтверждено, теперь у вас засчитано ${res1.rows[0].count} кальянов`,null, Klava)
          ctx.reply('Подтверждено')
        }
        else
        {
          //console.log(err1);
        ctx.reply('Ошибка при втором запросе')
        }
      })
    }
    else 
    ctx.reply('Ошибка при первом запросе');
    })
  }
}
else
ctx.reply('Ошибка')
    })
    //ctx.reply('HeheBoy')
  }
  else if(ctx.message.text.match(/Нет #\d/g)!=null)//Ответили "НЕТ "
  {
    let TransID=ctx.message.text.replace(/Нет #/g,'')//Получили id транзакции и лезем в бд
    client.query(isconfirm,[TransID],(err0,res0)=>{//
      if(!err0){                                   //
        if(res0.rows[0].isconfirm!=null)           //Защита от перезаписи
          ctx.reply('Ээээ нельзя перезаписывать')  //
        else{
              client.query(AddRes,[ctx.message.from_id, 0, ctx.message.date, TransID],(err,res)=>{
              if(!err)
              {   
                //console.log(res.rows[0].vk_from);
                ctx.reply('Отказ проведен');
                bot.sendMessage(res.rows[0].vk_from,'К сожалению, вам отказано в подтверждении :-(',null,Klava)
              }
              })
        }
              }
    })



    //ctx.reply('HeheGirl')
  }
  else  
    ctx.reply('За работу?')
  }
  //Если не чекер и первое сообщение
  else if(ctx.message.conversation_message_id==1)
  {//Если админ, то клаву предоставь 
    if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
    ctx.reply('Здарова, вот твоя админская клава',null,AdminKlava)
  }
  else
    ctx.reply('Привет, спасибо что написал, нажми синюю кнопку для регистрации или белую для вызова помощи',null,Markup.keyboard([Markup.button('Регистрация', 'primary'),'Помощь']))
  }
  else
  {
  //console.log(ctx.message.text);
  //console.log(ctx.session);
  if(AdminID.indexOf(ctx.message.from_id) !== -1)
  {
    ctx.reply('Здарова, вот твоя админская клава',null,AdminKlava)
  }
  else// незареган
    ctx.reply('Напиши: \n \t/reg - Для регистрации и получения виртуальной карты \n \t/status - Для получения информации о свой карте и полученных наклеек\n \t/request - Для отправки запроса на получение наклейки\n \t/info - Для получения информации о нашем заведении \n Или нажми на соответсвующую кнопку на клавиатуре',null,Klava);
  
  }
});


//Осталось дописать админку и вывод в txt,xls
//Дописать клавиатуры Check
//Предложить регистрацию про просмотре статуса и не нахождении пользователя Check

bot.startPolling()
