# 耶耶（Yeye）网页安全助手素材包

这套素材按用户提供的小狗照片特征设计：浅金色可卡犬、长卷耳、圆眼睛、薄荷蓝胸背。

## 定位

- 产品仍叫 **VibeShield**。
- 全局安全助手、浏览器浮动角色和动画角色叫 **耶耶 / Yeye**。
- UI 文案建议：`VibeShield with Yeye`、`让耶耶闻一闻这个功能`。

## 资产

- `assets/yeye_idle.*`：待机
- `assets/yeye_walk_1.*` / `walk_2`：巡逻
- `assets/yeye_sniff_1.*` / `sniff_2`：嗅探
- `assets/yeye_scan.*`：扫描
- `assets/yeye_alert.*`：发现风险
- `assets/yeye_protected.*`：Guard 生效
- `assets/yeye_rest.*`：休息
- `assets/yeye_sprite_sheet.png`：3×3 精灵表
- `demo.html`：可直接看的网页动画示例

## 本地预览

```bash
cd yeye_mascot_pack
python -m http.server 8088
```

打开 `http://localhost:8088/demo.html`。

## 动画原则

1. 没使用时，耶耶只在页面底部边缘小范围巡逻或休息，不能挡住按钮。
2. 用户开始扫描后，耶耶依次移动到真实被扫描 DOM 区域并切换为 sniff/scan。
3. 找到 Finding 后使用 alert；安装 Guard 后使用 protected。
4. 动画状态必须由真实 scan events 驱动，不能独立伪造扫描结果。
5. 尊重 `prefers-reduced-motion`。
