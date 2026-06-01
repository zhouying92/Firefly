import type { FooterConfig } from "../types/config";
import { loadOverride } from './loadOverride';

const defaultConfig: FooterConfig = {
	// 是否启用Footer HTML注入功能
	enable: false,
};

export const footerConfig: FooterConfig = {
	...defaultConfig,
	...loadOverride(import.meta.url, 'footerConfig.json'),
};

// 直接编辑 config/FooterConfig.html 文件来添加备案号等自定义内容
