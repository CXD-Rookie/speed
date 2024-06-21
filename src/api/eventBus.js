/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-06-21 10:58:41
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-06-21 10:58:47
 * @FilePath: \speed\src\eventBus.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// eventBus.js
import { EventEmitter } from 'events';

const eventBus = new EventEmitter();
export default eventBus;
