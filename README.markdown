# screeps新版设计(v1.0)

## 整合模块(全局任务、个人任务)
> 全局任务：建设任务、维护任务、采集任务、升级任务、扩张任务、自定义任务
> 角色管理：builder、harvster、upgrader、repair、miner、attacker、healer
> 移动优化：存储路线
> 运送分离：利用container减少carry
> creep死亡自动生成creep并继承前者任务单
> 优化防御措施：tower攻击与能量补给、合适时间触发安全模式、适当制造attacker防御
> 优化creep反复回跳(采集能量等行为时)

## 文件说明
> role.action.repair: 主要进行常见建筑的维护，如：tower、link、road
> role.action.tower: 攻击房间内敌方creep，若能量充足且不存在敌人时，辅助repair房间建筑(根据repair_task列表)
> role.action.creater: 实时监听房间creep情况，自动生产新的creep
> role.action.harvester: 采集能量矿，运输至房间内各个能量建筑，如spawn、extension、link
> role.action.upgrader: 升级房间等级
> role.action.builder: 建筑建设
> role.action.miner: 矿物采集
> role.action.expand: 占领其他房间，手动控制欲占领的目标房间
> role.common: 公共方法，主要包括creep的公共函数，少量建筑的公共函数
> creep.mod: creep模板(包含各creep数量，部件情况等)


### Memory Config (根据房间名存储，如:Memory['W35S3']['hasEnemy'])
| 对象 | 说明 | 特别说明 |
| :--- | :--- | :--- |
| room.struct | 建筑列表 | 可强制更新 |
| room.source | 能量矿列表 | 各个房间存在各自的能量矿(各自设置idx序号) |
| room.container | 能量矿列表 | idx序号与临近的能量矿相同，优先从container获取能量 |
| room.harvest | 上次采集任务列表 | 根据是否还存在任务自动刷新 |
| room.build | 需修建建筑列表 | 可强制更新 |
| room.repair | 需维护建筑列表 | 可强制更新 |
| room.mine | 记录房间内矿脉对象 | 暂作每房间一个矿脉 |
| room.hasEnemy | 是否存在敌人 | 默认false |
| room.record | 记录房间内某时间段boolean值 | record:{}, 无默认值(默认不存在) |
| global.expand | 欲占领房间列表 | 手动设置(未完成) |
| global.updateTime | 定时更新列表，其中包含需定时更新信息key:time形式 | 可强制更新 |


## Creep Config
| 对象 | 说明 | 说明补充 |
| :--- | :--- | :--- |
| color | 路径颜色 | 只在起始moveTo时显示，存储roadpath后不显示道路颜色 |
| num | 同类别creep数量 | 自动创建creep功能根据此参数判断 |
| part | creep部件种类与部件数量 | 自动创建creep功能中遍历此属性创建对应部件的creep，能量不足时，默认各部件数1 |
| role | creep种类 | creep自动创建时，以role+'_'+time命名,工作分配机制以名字中的role字符分配任务 |
| source | 各creep补给能量的能量矿目标 | 优先从同idx序列的container中补给能量 |
| task | creep当前任务idx | 当前任务列表下标，根据任务列表对象进行工作 |


## Global
```javascript
    global {
        // 扩张任务 若占领成功，删除此对象 【此对象手动生成】
        'expand': {
            creeps: [],
            targetRoot: []
        },

        // 记录全局某模块刷新时间,如：
        updateTime: [
            {'refreshRoom': 'Game.time'}
        ],

        rooms: {
            'roomName': {
                spawns: [],             // 此房间内所有spawn
                creeps: [],             // 此房间内所有creep
                source: [],             // source列表
                container: [],          // container列表
                repair: [],             // 需维护建筑
                build: [],              // 需建设建筑
                harvest: []             // 需能量供给建筑
            }
        }
    }


```

## 优化思路
```
  存储对象id,根据全局对象Game.xx.id获取对应对象，可避免因自我存储对象导致的对象状态固化的情况(数据不实时更新)
  注意点: 1、Game.xx.id获取的对象是否为游戏对象，或可能为单纯的数据存储，需测试
          2、使用Game.xxx方式获取对象与Game.getByID()性能消耗对比，若一致，使用getByID更为便捷
          3、若1测试结果为对象，后续任务列表存储于memory还是global中，各自性能消耗情况
          4、若存储全局对象，存储游戏对象与存储游戏对象id哪种性能比更佳

```

## 当前任务：
```javascript
  1、占领新房间
  2、(已完成)实现harvester运送分离(一个creep专门负责采集能量，存放至container中，其他creep从container中获取enery，
      减少采集者carry与move消耗，也能减少运输者采集花费的时间)
  3、自动创建creep存在bug，其中creep对象存储与全局Memory中，导致不同房间的creep合并计算，发生数量不匹配情况
  4、每个能量矿分配的creep(采集者)不合理,目前只设置了spawn能量供应矿点的采集者，应当对所有能量矿点进行采集者分配，
      并能根据各个能量矿点能量需求来分配对应采集者数量和container数量
  5、检查偶尔出现的房间creep数量不匹配情况(可能是其他房间creep数量导致的数量差异:猜测)
  6、添加创建creep后重置能量补给列表，目前创建creep后并未更新列表，导致spawn和部分原存在能量的储藏点能量被消耗而不知，
      花费多余能量用于tower等建筑 的补给，使得产生能量断层的风险，也使得紧急任务被后置，耽误时间
  7、优化tower维护，优先维护紧急任务，最后维护墙壁等建筑
  8、添加战时能量补给分配，优先从仓库中获取能量补给tower能量消耗，不足时再前往能量矿补给能量
  9、添加进攻者creep与防御者creep，当敌人进攻时，自动创建防御者进行防护，占领房间时，创建进攻者对目标房间发起进攻
  10、添加医疗兵creep，在战斗时可对己方士兵医治，最大程度减少损耗
  11、更新harvest和source后下一轮tick内容消失，但同层级的rooms[room].sturct并无消失情况，待修复
  12、添加维护者与建造者，当建造者完成所有建造任务时，自动帮助维护房间建筑
  13、bug - tower对象energy不发生变化，导致判断能量无效，一直处于激活状态，直到能量用尽
  14、bug - build未能及时删除内存道路，导致creep完成目标后依旧走完内存道路再执行新任务
```