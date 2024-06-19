import { Message, Plugin } from 'zhin';
import * as path from 'path';
import '@zhinjs/plugin-sandbox';
import type {} from './functionParser';
import type {} from '@zhinjs/client/src';
const test = new Plugin('测试插件'); // 定义插件
test.required('functionManager', 'component'); // 声明插件必须依赖的服务
test
  .command('test-confirm') // 插件功能
  .hidden()
  .action(async runtime => {
    const isConfirm = await runtime.prompt.confirm('确认吗');
    return `${isConfirm ? '已确认' : '已取消'}:${isConfirm} ${typeof isConfirm}`;
  });
test
  .command('test-text [test:number] [abc:boolean]')
  .hidden()
  .action(async ({ adapter, message, prompt }, text) => {
    const input = await prompt.text('请输入文本');
    return `inputResult:${input} ${typeof input}`;
  });
test
  .command('test-number')
  .hidden()
  .action(async runtime => {
    const input = await runtime.prompt.number('请输入数值');
    return `inputResult:${input} ${typeof input}`;
  });
test
  .command('test-list')
  .hidden()
  .action(async runtime => {
    const input = await runtime.prompt.list('请输入', {
      type: 'text',
    });
    return `inputResult:${input} ${typeof input}`;
  });
test
  .command('test-pick')
  .hidden()
  .action(async ({ prompt }) => {
    const input = await prompt.pick('请选择你喜欢的水果', {
      type: 'text',
      multiple: true,
      options: [
        {
          label: '苹果',
          value: 'apple',
        },
        {
          label: '香蕉',
          value: 'banana',
        },
        {
          label: '橙子',
          value: 'orange',
        },
      ],
    });
    return `inputResult:${input} ${typeof input}`;
  });
test.required('addEntry');
test.mounted(() => {
  test.addEntry(path.resolve(__dirname, '../client/index.ts'));
  test.component({
    name: 'test2',
    render(_, context) {
      return `<slot/>,一天天的就知道钓鱼，该上学上学，该上班上班`;
    },
  });
  test.component({
    name: 'test',
    props: {
      who: {
        type: String,
        default: '张三',
      },
    },
    render(props, context) {
      return `不务正业!${context.who}`;
    },
  });
});
// test
//   .command('钓鱼')
//   .alias('🎣')
//   .sugar(/^.(钓鱼)|(🎣)$/)
//   .action(({ message }) => `<test2><test who="${message.sender.user_id}"/></test2>`);
test.mounted(async () => {
  test.register('hello', function (this: Message, foo, bar, isExist = false) {
    console.log(1111111);
    return `receive from ${this.message_type},args is ${foo},${bar},${isExist}`;
  });

  test.middleware(async (_1, _2, event, next) => {
    await next();
    return test.functionManager.match(event);
  });
});
export default test; // 最后导出
