/*
* ZTE Modem Monitor Panel - Universal Version (Mac & iOS)
* GitHub: Rabbit-Spec/ZTE-Modem-TimeSync-Shortcut
* v0.1
*/

const IP = "192.168.1.1";
const USER = "root";
const PASS = "Zte521";
const EXPECT_PATH = "/opt/homebrew/bin/expect"; 

// 检查是否具备执行本地命令的能力 (Mac 专属)
const isMac = typeof $utils !== "undefined" && typeof $utils.exec === "function";

if (isMac) {
    const cmd = `${EXPECT_PATH} -c 'set timeout 5; spawn telnet ${IP}; expect "Login:"; send "${USER}\\r"; expect "Password:"; send "${PASS}\\r"; expect "/ # "; send "uptime; top -n 1 | grep CPU; cat /proc/pon_info\\r"; expect "/ # "; send "exit\\r"; expect eof'`;

    $utils.exec("bash", ["-c", cmd], (stdout, stderr) => {
        if (stdout) {
            const rxPower = stdout.match(/Rx Power\s+:\s+([-\d.]+)/)?.[1] || "N/A";
            const cpuUsage = stdout.match(/CPU:\s+([\d.]+%)/)?.[1] || "N/A";
            const uptime = stdout.match(/up\s+([\d\s\w,:]+),/)?.[1] || "N/A";

            const content = `🌡 光衰: ${rxPower} dBm  |  💻 CPU: ${cpuUsage}\n⏱ 运行时间: ${uptime}`;
            
            // 将数据存入持久化存储，方便 iOS 端通过 iCloud 同步查看
            $persistentStore.write(content, "ZTE_Modem_Data");

            $done({
                title: "中兴光猫状态 (Mac)",
                content: content,
                icon: "router",
                "icon-color": "#007AFF"
            });
        } else {
            $done({ title: "连接失败", content: "请检查 Mac 端 Telnet 环境", icon: "exclamationmark.triangle", "icon-color": "#FF3B30" });
        }
    });
} else {
    // iOS 环境逻辑：从缓存读取 Mac 同步的数据
    const cachedData = $persistentStore.read("ZTE_Modem_Data");
    $done({
        title: "中兴光猫状态 (iOS)",
        content: cachedData ? cachedData : "⏳ 请先在 Mac 端 Surge 运行以同步数据",
        icon: "iphone",
        "icon-color": "#34C759"
    });
}
