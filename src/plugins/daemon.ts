import {Zhin, Bot} from "@";
import {Context} from "@/context";
export const name='systemDaemon'
export function install(ctx:Context, config:DaemonConfig={}){
    const {exitCommand=true, autoRestart = true} = config||{}
    function handleSignal(signal: NodeJS.Signals) {
        ctx.app.logger.info(`terminated by ${signal}`)
        process.exit()
    }
    interface Message {
        type: 'send'
        body: any,
        times?:number
    }
    exitCommand && ctx
        .command(exitCommand === true ? 'exit' : exitCommand)
        .desc('关闭bot')
        .hidden()
        .auth('master','admins')
        .option('restart', '-r  重新启动')
        .shortcut('关机')
        .shortcut('重启', {options: {restart: true}})
        .action(async ({options,session}) => {
            const channelId = Bot.getFullTargetId(session);
            if (!options.restart && !autoRestart) {
                await session.reply('正在关机...').catch(()=>{})
                process.exit()
            }
            process.send({type: 'queue', body: {channelId, message: '已成功重启.'}})
            await session.reply('正在重启...').catch(()=>{})
            process.exit(51)
        })
    ctx.app.on('ready', () => {
        process.send({type: 'start', body: {autoRestart}})
        process.on('SIGINT', handleSignal)
        process.on('SIGTERM', handleSignal)
    })
    const handleMessage=(data: Message) => {
        if (data.type === 'send') {
            let {channelId, message} = data.body
            const [protocol,self_id,target_type,target_id]=channelId.split(':') as never[]
            const times=data.times
            const bot=ctx.app.pickBot(protocol as keyof Zhin.Adapters,self_id)
            if (bot && bot.isOnline()) {
                if(times) message+=`耗时：${(new Date().getTime()-times)/1000}s`
                bot.sendMsg(target_id,target_type, message)
            } else {
                const dispose = ctx.app.on('bot.online', (platform,bot_id) => {
                    if(times) message+=`耗时：${(new Date().getTime()-times)/1000}s`
                    if(bot.adapter.protocol===platform && bot.self_id===bot_id){
                        bot.sendMsg(target_id,target_type, message)
                        dispose()
                    }
                })
            }
        }
    }
    process.on('message', handleMessage)
    ctx.on('dispose',()=>{
        process.off('SIGINT',handleSignal)
        process.off('SIGTERM',handleSignal)
        process.off('message',handleMessage)
    })

}
export interface DaemonConfig {
    autoRestart?: boolean
    exitCommand?: string|boolean
}