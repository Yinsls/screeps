import {CommCreep, CommUpdate, CommTest} from './common'

// 功能测试文件
class Test {
  // 简写测试cpu性能消耗函数
  public test = CommTest.spendCpu

  /** 测试Game对象中存储的对象是否可直接使用 */
  testGameObj(id:string) {
    this.test(function() {
      const target = Game.constructionSites[id];
      if(target) {
        console.log(JSON.stringify(target));
      }
    }, '测试: Game对象是否可用')
  }

  /** 测试Game.xxx调用与Game.getObjectById性能比较 */
  testGetObjTime(id:string) {
    this.test(function() {
      JSON.stringify(Game.constructionSites[id]);
    }, '测试: Game.xxx方式获取对象')

    this.test(function() {
      JSON.stringify(Game.getObjectById(id));
    }, '测试: Game.getObjectById方式获取对象')
  }

  /** 测试遍历memory与global的性能消耗 - object */
  testLoopObj() {
    const example = {
      name1: '张三',
      name2: '李四',
      address: 'HZ',
      phone: '123123123',
      color: 'red',
      status: '404',
      energy: 100,
      type: 'structure',
      part: 500,
      isTure: false
    }
    global.test1 = example;
    Memory['test1'] = example;
    // 遍历其根节点的test1对象
    this.test(function() {
      let total = 0;
      for(const key in global.test1) {
        if(global.test1[key]) {
          total++;
        }
      }
      console.log('total: ' + total)
    }, '测试: global.getObj')

    this.test(function() {
      let total = 0;
      for(const key in Memory['test1']) {
        if(Memory['test1'][key]) {
          total++;
        }
      }
      console.log('total: ' + total)
    }, '测试: Memory.getObj')

    delete global.test1;
    delete Memory['test1'];
  }

  /** 测试遍历memory与global的性能消耗 - array */
  testLoopArr() {
    const example = [123,3345,834,'aa.b',5423,746534,0,'gsg',9,10];
    global.test2 = example;
    Memory['test2'] = example;
    // 遍历其根节点的test2对象
    this.test(function() {
      let total = 0;
      for(const key in global.test2) {
        if(global.test2[key]) {
          total++;
        }
      }
      console.log('total: ' + total)
    }, '测试: global.getObj')

    this.test(function() {
      let total = 0;
      for(const key in Memory['test2']) {
        if(Memory['test2'][key]) {
          total++;
        }
      }
      console.log('total: ' + total)
    }, '测试: Memory.getObj')

    delete global.test2;
    delete Memory['test2'];
  }

}