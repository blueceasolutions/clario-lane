### PRE-INSTALLATIONS
1. Update and Upgrade 
```
apt update && apt upgrade
```
2. Install nginx
```
apt install nginx -y
```
3. Check nginx status
```
systemctl status nginx
```
4. 
```
cd /home/$USER
```
5. Clone repo (OPTIONAL IF THERE'S NO CICD)
```
git clone https://github.com/giprim/clario-lane.git
```
6. 
```
cd clario-lane/
```
7. Check nginx version 
```
nginx -v
```
8. 
```
cd /etc/nginx/sites-available/
```
9. 
```
vi /etc/nginx/sites-available/clariolane.com
```
Server config
```
server {
    listen 80;
    server_name clariolane.com www.clariolane.com;
    root /var/www/html;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}       
```
There was an issue: During authentication `clariolane.com/auth` the page renders `404` because it is running into a classic Single Page Application (SPA) routing issue. The fix for Netlify was to add a `netlify.toml` file
```
    [[redirects]]
      from = "/*"
      to = "/index.html"
      status = 200
```
For `nginx`: On a Linux server, you don't use a `.toml` file. You must update your `Nginx` site configuration to tell it. "If you can't find the file the user is looking for, just give them `index.html` and let the `JavaScript` handle the rest."
```
vi /etc/nginx/sites-available/clariolane.com
```
Then change `=404` to `/index.html`
```
server {
    server_name clariolane.com www.clariolane.com;
    root /var/www/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
} 
```
Validate:
```
sudo nginx -t
```
Restart Nginx
```
sudo systemctl restart nginx
```
10. 
```
ls /etc/nginx/sites-enabled
```
11. 
```
ln -s /etc/nginx/sites-available/clariolane.com /etc/nginx/sites-enabled
```
12. 
```
ls /etc/nginx/sites-enabled
```
13. Verify if there are issues with the config
```
nginx -t
```
14. 
```
cd /var/www/html
```
15. 
```
ls
```
16. Change the name of the current `.html` file 
```
mv index.nginx-debian.html index.html
```
17. Reload Nginx
```
systemctl reload nginx
```
18. Nginx Status
```
systemctl status nginx
```
19. Install a modern Node from NodeSource (recommended)
```
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
20. Verify
```
node -v
npm -v
```
21. 
```
cd /home/$USER/clario-lane/
```
22. Add the Environment Variables
```
export VITE_SUPABASE_URL=" "

export VITE_SUPABASE_ANON_KEY=" "

export VITE_PAYSTACK_PUBLIC_KEY=" "
```
> [!Note]
> Always add the environment variables before the `npm run build` stage.
23. Now install your dependencies
```
npm install
```
This generates the node-modules needed for the job
24. Build The Application
```
npm run build
```
This will create a `dist/` folder. This contains static HTML, JS, CSS that NGINX can serve.
25. OPTIONAL: 
```
apt install node-typescript
```
26. 
```
ls `dist`
```
28. Delete all the files in the `/var/www/html/` directory
```
sudo rm -rf /var/www/html/*
```
29. Recursively Copy all the files in the `dist/` directory 
```
sudo cp -r dist/* /var/www/html/
```
30. 
```
ls /var/www/html/
```
31. Restart Nginx
```
systemctl restart nginx
```
32. 
```
systemctl status nginx
```

#### NAME SERVER AND DOMAIN NAME SYSTEM SETUP
This is the connection between `Namecheap` where our `Domain Name` resides and `Digital Ocean` where our `Servers' IP` will match with the `Domain Name(Hostname)`
1. Go to `Namecheap`, then click on `Domain List`, then click on the `Domain`
2. Select `Custom DNS` - This is to allow us use our `Digital Ocean Name Servers`. They are `ns1.digitalocean.com`, `ns2.digitalocean.com` and `ns3.digitalocean.com`
<img width="782" height="185" alt="image" src="https://github.com/user-attachments/assets/33826c20-f947-412e-a2c5-fa5ad046f766" />

3. Click on the `Check Mark` to save
<img width="945" height="185" alt="image" src="https://github.com/user-attachments/assets/3bd1d47d-aa0c-4ae9-9a6e-73ab2df19ce4" />

4. Go to `Digital Ocean` and click on `NETWORKING`
<img width="412" height="950" alt="image" src="https://github.com/user-attachments/assets/d3fe3670-30d8-44de-b527-36097b14f4a8" />

5. Select `Domains` and `Add A Domain`
6. Enter the name of the domain
7. Click on `Create a Record` <br>
`Record Type`: `A` ...... A records map an IPv4 address to a domain name. This determines where to direct any requests for a domain name. <br>
`Hostname`: `@` - This creates the record at the domain root, e.g `clariolane.com` <br>
`Will direct to`: The `Server's Public IP` <br>
<img width="609" height="727" alt="image" src="https://github.com/user-attachments/assets/8e24ea09-0fc9-4000-8423-d60e7b7f5e38" /> <br>
`For www` https://www.youtube.com/watch?v=5c5cir0kboU <br> 
`Record Type`: `CNAME` ...... CNAME records act as an alias by mapping a hostname to another hostname. <br>
`Hostname`: `www` - This creates the record with `www`, e.g `www.clariolane.com` <br>
`Is an alias of`: `@`: This maps the `Hostname` to the value `clariolane.com` <br>
This helps to route `www.clariolane.com` to `clariolane.com` - `http://clariolane.com` (if not secured) or `https://clariolane.com` (if secure)
<img width="609" height="705" alt="image" src="https://github.com/user-attachments/assets/c2f197ef-e4c4-419d-a2e8-c030902859bf" />

33. Configure SSL Certificate with Let's Encrypt
```
snap install --classic certbot
```
34. 
```
certbot --nginx
```
The certificate is configured to automatically renew before expiration of the certificate!
35. If there's an issue 
```
vi /etc/nginx/sites-available/clariolane.com
```
Make changes and save
```
ln -s /etc/nginx/sites-available/clariolane.com /etc/nginx/sites-enabled
```
Validate
```
nginx -t
```
35. 
```
systemctl reload nginx
```
36. Reload Nginx if there are issues with Nginx and Disk
```
sudo systemctl daemon-reload
```

### UNINSTALL NPM AND NODEJS
```
sudo apt remove nodejs npm -y
sudo apt purge nodejs npm
sudo apt autoremove -y
```
To clean leftover files:
```
sudo rm -rf /usr/local/lib/node_modules
sudo rm -rf ~/.npm
sudo rm -rf ~/.nvm
```

### UPTIME MONITORING
Uptime checks monitor our site and alert us on any latency or downtime.
<img width="1297" height="406" alt="image" src="https://github.com/user-attachments/assets/468bfae3-952d-4ab7-bdc3-575e5c18f59e" />
1. Go to `Monitoring`
2. Click on `Create Uptime Check`
3. Choose HTTPS because this is the standard, besides our website has `SSL`
4. The endpoint to check for availability should be: `https://www.clariolane.com`
5. The region should be ALL e.g `Asia East`, `USA East`, `USA West` and `Europe`
6. Choose a very descriptive name e.g `Clariolane-Ubuntu_Prod_Uptime`
7. Create an alert that notify us when the website is down. The name can be `Clariolane-Website_Prod_Uptime_Alert`
8. This alert should look out for Latency(Site Speed is reduced `1000ms in 2min`), Downtime(When site is offline for 2min in `all regions`) and SSL Cert Expiration date(Threshold can be in `90 days`)

### SETUP SERVER RESOURCE ALERTS
Resource Alerts are meant to monitor our Server's Resource Utilization and sends us alerts when they pass the set thresholds.
<img width="1297" height="529" alt="image" src="https://github.com/user-attachments/assets/07943faf-959f-4382-8616-134bd1463f32" />

1. We should be able to know when our server's resource utilization has exceeded the set threshold
2. Go to `Monitoring`
3. Click on `Resource Alerts`
4. Click on `Create Resource Alerts`
5. Select the Metric Type, e.g `CPU`, `Disk`, `Memory Utilization`, etc. One at a time
6. `CPU Utilization Threshold:` Rule = `is above`, Threshold = `50%`, Duration = `5min`
7. `Memory Utilization Threshold:` Rule = `is above`, Threshold = `70%`, Duration = `5min`
8. `Disk Utilization Threshold:` Rule = `is above`, Threshold = `70%`, Duration = `5min`
9. Choose the droplet that it will be applied to or the `Tag` of the droplet or droplets
10. The notification method should be by `Email`
11. Choose a very descriptive name e.g `Clariolane-Ubuntu_Prod_CPU Utilization Percent is running high`
12. Then perform the same proceedure for the next metric.

### FIREWALL
Firewall rules control what inbound and outbound traffic is allowed to enter or leave a Droplet.
1. Go to cloud.digitalocean.com/networking
2. Click on the `NETWORKING` tab
3. Click on `Firewalls`
4. Create Firewall
5. Give it a name
6. Setup `Inbound Rules`: Set the Firewall rules for incoming traffic. Only the specified ports will accept inbound connections. All other traffic will be dropped.
- `SSH:` `TCP` `22` `All IPv4` `All IPv6` - To allow SSH Connections into the server
- `HTTP:` `TCP` `80` `All IPv4` `All IPv6` - To allow the website to be reached through http, though not secure.
- `HTTPS:` `TCP` `443` `All IPv4` `All IPv6` - To allow the website to be reached through `HTTPS`
<img width="1241" height="467" alt="image" src="https://github.com/user-attachments/assets/bb9d220a-13bb-413a-be1b-b55d94d2befe" />

7. Setup `Outbound Rules`: Set the Firewall rules for outbound traffic. Outbound traffic will only be allowed to the specified ports. All other traffic will be blocked.
<img width="1241" height="467" alt="image" src="https://github.com/user-attachments/assets/dcafd804-d69a-49c7-920f-5e0a1ced702b" />

8. Apply to Droplets: Select Droplets to apply your Firewall rules to.
<img width="1241" height="288" alt="image" src="https://github.com/user-attachments/assets/af325b19-4275-417e-8e7f-e6b0cc50af0b" />

<img width="1233" height="336" alt="image" src="https://github.com/user-attachments/assets/55e7a5e1-c67e-45e5-b9ea-c5a0afa4bc51" />

### `FIREWALL SETUP ON UBUNTU`
1. Secure the server with `UFW` --- https://www.youtube.com/watch?v=68GTL7djIMI
2. If a `firewall` is not configured, this leaves the server's port open, even ports you never intended to be open will be open
3. Each port is like a door and without a firewall, all the doors are unlocked by default, so the firewall helps us lock all the doors and opens the ones we specify to be open e.g `Ports 80 and 443 for websites` and `22 for SSH`
4. SSH into the Server from the console
5. Use `UFW(Uncomplicated Firewall)` to do this
6. Check if `UFW` is installed
    ```
    which ufw
    ```
    and you'll see the directory where it was installed: `/usr/sbin/ufw`
    Or you can install it with:
    ```
    apt install ufw
    ```
8. Check `ufw status`
    ```
    ufw status
    ```
    It's mostly inactive
9. Allow SSH:
    ```
    ufw allow 22/tcp
    ```
    OR
    ```
    ufw allow OpenSSH
    ```
    This updates the rules for both IPV4 and IPV6 for SSH
10. Enable `UFW`
    ```
    ufw enable
    ```
11. Check `ufw` status
    ```
    ufw status
    ```
    OR
    ```
    ufw status verbose
    ```
13. Once you have made that rule and enabled `ufw` if you go to your browser and enter either the IP of the server or the website url, it doesn't load anymore, because even if the `Security Group` allows them, the `ufw` doesn't, so it overights it. `Ports 80` and `443` have been blocked because of the firewall
14. We have to go back to the server and add the two ports as exceptions too
    ```
    ufw allow 80/tcp
    ```
    and
    ```
    ufw allow 443/tcp
    ```
    OR use the shortcut
    ```
    ufw allow 'Nginx Full'
    ```
    Go back to your browser and the website starts working!
> [!NOTE]
If `Security Group` allows it and `ufw` denys: It wont work <br>
If `Security Group` allows it and `ufw` allows: It will work <br>
If `Security Group` denys it and `ufw` denys: It wont work <br>
If `Security Group` denys it and `ufw` allows: It wont work
15. For `ufw status`
    ```
    ufw status verbose
    ```
### `SECURE SSH KEY LOGIN ON UBUNTU`
> [!NOTE]
> When you create the `New USER`, also run `ssh-keygen` and add your `Local Machine's` `Public Key` to the `.ssh/authorized_keys` in this `New USER` directory, if not, you can't be able to `SSH` into the `New USER` from you `Local Machine`
> If you add your `Local Machine's` `Publick Key` to the `./root/.ssh/authorized_keys` just because the `New USER` now has `sudo privileges`, it will only be able to `SSH` into the `root` user, which is what we don't want - Some `$USERS` can have `sudo` access, but they shouldn't be able to `SSH` into the Server as `root`, e.g `root@124.34.34.120`
> After creation of the `New USER`, immediately create the `SSH KEYGEN`, add the `Public Keys` of `Local Machines` to the `authorized_keys`, then go back to the `root` user and give permissions to the `$USER Directory` - `home/guddy`, `.ssh directory` - `/home/guddy/.ssh`, the `authorized_keys directory` - `/home/guddy/.ssh/authorized_keys` and `Change Owner` of the `.ssh directory` to the `$USER` - `/home/guddy/.ssh`

1. No Root, No Password --- https://www.youtube.com/watch?v=8ugcUTNoGj4
2. Do not use SSH with login password xxx
3. Access the remote server from the console
4. Running your server as root e.g `root@ip-172-31-74-125`, `root@hello` or `root@hostname` is a `SECURITY VULNERABILITY!!!`
> [!IMPORTANT]
Never run your server as `root@` <br>
Instead create a user and assign `root privileges` <br>
If someone gets hold of the server, they can permanently lock you out!
5. ADD A NON-ROOT USER WITH SUDO PRIVILEGES
    ```
    adduser guddy
    ```
    Enter password, confirm the password and enter the name of the user.
    You'll see stuff like this:
    ```
    info: Adding new user `guddy' to supplemental / extra groups `users' ...
    info: Adding user `guddy' to group `users' ...
    ```
    Check `/home` to see the created user
6. Now Let's check if this is working and he can't perform anything that has to do with root access
7. Login to the server using the new username `guddy` on the console or go to your local machine and run 
    ```
    ssh guddy@PUBLIC_IP
    ```
    example:
    ```
    ssh guddy@98.89.6.73
    ```
    For the local machine, it might not run because the local machine's `Public Key` hasn't been added to the `authorized_keys` in the remote server with the user `guddy`
8. Try to edit the `/etc/var/www/html/index.html` file
    ```
    vi /var/www/html/index.html
    ```
    Make changes and try to save, it won't allow you save it because `guddy` is not a `root user`
    Quit:
    ```
    ESC : q!
    ```
    And try with sudo:
    ```
    sudo vi /etc/var/www/html/index.html
    ```
    Enter your password. It will say `guddy is not in the sudoers file.`
    ```
    guddy@ip-172-31-74-125:/var/www/html$ sudo vi index.html
    [sudo] password for guddy: 
    guddy is not in the sudoers file.
    guddy@ip-172-31-74-125:/var/www/html$ 
    ```
    This is `GOOD` because he doesn't have `sudo privileges` 
9. For the newly created user to have elevated privileges like `root`, we have to add him to the `sudo group`
    ```
    usermod -aG sudo guddy
    ```
    If you try the same thing in Number 8, it will work flawlessly
10. *** You can also enter `root@` from `guddy@`
11. Generate SSH key pair with `ssh-keygen`: For better security, instead of `password`, create an ssh key from your laptop
    ```
    ssh-keygen -t ed25519 -C "My DigitalOcean Droplet"
    ```
    Enter and enter and enter. They are stored here: <br>
    Your identification has been saved in `/root/.ssh/id_ed25519` <br>
    Your public key has been saved in `/root/.ssh/id_ed25519.pub`
12. Copy the `public key(.pub)` to the remote server with `ssh-copy-id`, so it knows in advance that it's allowed to connect to the server.
    ```
    ssh-copy-id guddy@172.31.74.125
    ```
    What actually worked for me was to `cat` the `/root/.ssh/id_ed25519.pub` file and copy the code and save it in the `~/.ssh/authorized_keys` file in the remote server. 
> [!NOTE]
> When you create the `New USER`, also run `ssh-keygen` and add your `Local Machine's` `Public Key` to the `.ssh/authorized_keys` in this `New USER` directory, if not, you can't be able to `SSH` into the `New USER` from you `Local Machine`
> If you add your `Local Machine's` `Publick Key` to the `./root/.ssh/authorized_keys` just because the `New USER` now has `sudo privileges`, it will only be able to `SSH` into the `root` user, which is what we don't want - Some `$USERS` can have `sudo` access, but they shouldn't be able to `SSH` into the Server as `root`, e.g `root@124.34.34.120`
> After creation of the `New USER`, immediately create the `SSH KEYGEN`, add the `Public Keys` of `Local Machines` to the `authorized_keys`, then go back to the `root` user and give permissions to the `$USER Directory` - `home/guddy`, `.ssh directory` - `/home/guddy/.ssh`, the `authorized_keys directory` - `/home/guddy/.ssh/authorized_keys` and `Change Owner` of the `.ssh directory` to the `$USER` - `/home/guddy/.ssh`

`HOW TO SETUP THE NEW CREATED USER`
- To generate the normal `RSA` Private and Public keys 
    ```
    ssh-keygen
    ```
    To generate `ed25519` Private and Public keys
    ```
    ssh-keygen -t ed25519 -C "My DigitalOcean Droplet"
    ```
- Copy the `/root/.ssh/id_rsa.pub` or `/root/.ssh/id_ed25519.pub` key
- SSH into the remote server with `ubuntu` or `ec2-user` then run this command to switch user to `guddy`
    ```
    sudo su - guddy
    ```
    The user changes to `guddy@ip-172-31-74-125:~$`
- Create the `.ssh` Directory: Create the `.ssh` directory and set the strict permissions required for SSH. SSH will usually reject a login if these permissions are too permissive.
    ```
    mkdir -p ~/.ssh
    ```
- Create the `authorized_keys` File: Create the `authorized_keys` file inside the `.ssh` directory and set its permissions.
    ```
    vi ~/.ssh/authorized_keys
    ```
    Then paste the `Public Key` e.g `id_rsa.pub` and save
- Fix Directory and File Permissions: You need to connect back to the EC2 instance as the original user (e.g., `ec2-user` or `ubuntu`) and use `sudo` to fix these permissions for the user guddy. <br>
    Run these commands as the `root user` or by using `sudo` from the original user account: <br>
    `Home Directory:` Ensures only guddy can access their home directory. (Less common issue on modern EC2)
    ```
    sudo chmod 700 /home/guddy
    ``` 
    `.ssh Directory:` Ensures only guddy can read, write, and execute in this directory.
    ```
    sudo chmod 700 /home/guddy/.ssh
    ```
    `authorized_keys:` Ensures only guddy can read and write this file. This is CRITICAL.
    ```
    sudo chmod 600 /home/guddy/.ssh/authorized_keys
    ```
    `Owner:` Ensures guddy is the owner of the .ssh folder and its contents.
    ```
    sudo chown -R guddy:guddy /home/guddy/.ssh
    ```
- Test the SSH Connection (Local Machine): Since your key is already loaded or is in the default location on your local machine, you should be able to `SSH` without the `-i` flag (which is used for non-default or `.pem` files):
    ```
    ssh guddy@your-ec2-public-ip-or-dns
    ```
    You wont have any root access except the ones that have been given by the root user e.g `ubuntu` or `ec2-user` and this is very good.
- If the connection still fails, you can run the SSH client in verbose mode to get more debugging output. This is the single most helpful step for diagnosing SSH key issues.
    ```
    ssh -v guddy@your-ec2-public-ip-or-dns
    ```
- TROUBLESHOOT: Connect as the original user and check the SSH configuration file
    ```
    grep -E "PubkeyAuthentication|PasswordAuthentication" /etc/ssh/sshd_config
    ```
13. Login to the remote server from local PC
    ```
    ssh guddy@172.31.74.125
    ```
    What worked for me was `root@172.31.74.125` The public IP, this is `NOT GOOD`, use `ssh guddy@Public_IP`
    This time it wont ask for a password, because we are now using the generated key.
> [!IMPORTANT]
Even if your machine is able to `SSH` into the server because the `Public Key` has been added to the `authorized_keys` in the remote server, if the local machine's `IPV4 Public IP Address` is not added to the `Security Group` for `SSH(Port 22)`, it can't `SSH` into the remote server. <br>
Always remove `SSH` at `0.0.0.0` out of `Security Group Inbound Rules`.
14. Disable root login and password authentication
    ```
    sudo vi /etc/ssh/sshd_config
    ```
    Uncomment and change `PermitRootLogin = prohibit-password/yes` to  `PermitRootLogin = no` <br>
    Uncomment and change `PasswordAuthentication yes` to `PasswordAuthentication no` and `#PermitEmptyPasswords no` <br>
    Change `UsePAM yes` to `UsePAM no` <br>
    Change `X11Forwarding yes` to `X11Forwarding no` This is for if you want to display a remote GUI over SSH <br>
    Add `AuthenticationMethods publickey` <br>
    Add `AllowUsers guddy` <br> <br>
    `CHANGES:`
    ```
    Important sshd_config File Changes:
    PermitRootLogin no 
    PasswordAuthentication nos
    PermitEmptyPasswords no
    KbdInteractiveAuthentication no
    UsePAM no
    X11Forwarding no
    AuthenticationMethods publickey
    AllowUsers guddy
    ```
    Save.
15. ...

✅ Disable root login and password authentication
✅ Update sshd_config for key-only access
✅ Restart SSH and verify your hardened setup

### FOR GITHUB ACTIONS CICD
1. SECRETS: 
    - `SERVER_SSH_KEY` = This is the `Private Key`(Server's Private Key) for the `$USER`(e.g `root` or `guddy`) in the server
    - `SERVER_HOST` = This is the `Server's Public IP` e.g `157.37.27.225`
    - `SERVER_USER` = This is the `Server's USER`(e.g `root` or `guddy`)
    - `VITE_PAYSTACK_PUBLIC_KEY` = " "
    - `VITE_SUPABASE_ANON_KEY` = " "
    - `VITE_SUPABASE_URL` = " "
    - `/root/.ssh/authorized_keys` = This is where the `Server's Public Key`(for the `$USER` e.g `root` or `guddy`) will reside. This allows a handshake with it's `Private Key` in `SERVER_SSH_KEY` on GitHub. If it's a non `root` user, you'll have to setup `ssh` with `ssh-keygen` for the `$USER`.
2. User's(e.g `root` or `guddy`) `Public Key` will be in the Server's Authorized_Keys and the User's(e.g `root` or `guddy`) `Private Key` will be in GitHub Secrets. 
3. For normal local machine `SSH`, the User's `Public Key` will be added the the Server's `/$USER/.ssh/authorized_keys` file, so that the machines's `Private Key` unlocks the `Public Key` in the Server.

### SETTING UP AN OFFCIAL/CUSTOM MAIL FOR CLARIOLANE
Choosing the right email addresses for Clariolane is a great step toward building a professional brand.
So we need an official/corporate/custom private mail for `info` and `support` purposes.
1. `Use a Custom Domain:` Avoid using `clariolane@gmail.com`. Having `@clariolane.com` instantly builds trust with customers.
- Go to Namecheap.com > Private Email 
- Purchase the mail service: Free Trial for 2 months or 1$/Month
- Purchase ONLY `admin@<domain name>` as we'll be using aliases so we don't spend much
- After the purchase click on `Private Email` again
<img width="1905" height="541" alt="image" src="https://github.com/user-attachments/assets/b5d67448-2fd0-4a3e-be9c-2dab6bc98079" />

- Click on `Manage` > Catch all mailbox(to create your mail) e.g `admin@clariolane.com`
  
<img width="1251" height="158" alt="image" src="https://github.com/user-attachments/assets/a5e48952-118e-4baf-8595-0c83ece3bce4" />

2. `Manage admin@clariolane.com aliases (Save Money):` You don't necessarily need to pay for two separate mailboxes. You can have one primary inbox (like `admin@clariolane.com`) and set up `hello@`, `info@`, `clariolane@` and `support@` as aliases that all forward to that one place.
>[!Note]
>Every mailbox has a main address – for example, 1@example.com. You may associate aliases to that same mailbox, such as 2@example.com and 3@example.com. The main address and all aliases share the same inbox, contacts and settings. Aliases are for receiving email only and cannot be used to login or send email. 
This helps to reduce the cost of buying three `Private Mails`

<img width="1707" height="556" alt="Image" src="https://github.com/user-attachments/assets/9f72f18e-ed39-445a-92d5-a286ed18b1b5" />

### HOW TO ADD ALIASES
1. `Get your primary email (admin@clariolane.com)`
If you haven't already, you need to purchase a Private Email plan from Namecheap.
Cost: Usually around $1/month (Starter plan).
The Plan: The "Starter" plan allows you to have 1 primary mailbox but up to 10 aliases for free. This is perfect for your needs.
How to buy: Go to Namecheap > Email > Private Email and follow the checkout process for clariolane.com.

2. `Create your Aliases (clariolane@, hello@, support@ and info@)`
- Once your `admin@clariolane.com` is active, you don't need to pay for more mailboxes. You just add the aliases through your Namecheap dashboard:
- Log in to your Namecheap account.
- Go to Private Email in the left sidebar.
- Click the Manage button next to your domain.
- Scroll down to the Mailboxes section.
- Find `admin@clariolane.com` and click the arrow/dropdown next to the "Edit Storage" button.
- Select Manage Aliases.
- Click Add Alias and type in support. Repeat for info.
- Click Save Changes.
- Go to https://privateemail.com/appsuite/signin to signin with the `Email` and `Password`

What happens now: Any email sent to `clariolane@clariolane.com`, `support@clariolane.com`, `hello@clariolane.com` or `info@clariolane.com` will instantly show up in your `admin@clariolane.com` inbox.

<img width="1504" height="861" alt="Image" src="https://github.com/user-attachments/assets/4161bd5b-9614-46ea-b505-0d4768757e22" />

<img width="1915" height="756" alt="image" src="https://github.com/user-attachments/assets/669adbf9-61c6-4e3c-94e6-bac85192ea2f" />

### FIX

<img width="1504" height="744" alt="Image" src="https://github.com/user-attachments/assets/129759aa-41e7-4921-ac0e-cb89283c762d" />

<img width="1912" height="717" alt="Image" src="https://github.com/user-attachments/assets/e834b7d9-ea7a-4bf3-abe6-94c02c07f223" />

4. `Email Signatures:` Ensure both emails have a consistent signature that includes your logo, website link, and perhaps a social media handle.

### MAIL NAMESERVER ISSUES FOR CLARIOLANE
Our Nameservers are from `DigitalOcean` and not `Namecheap`. For this reason, we are not using `Namecheap BasicDNS` to manage records, rather the `CustomDNS`. For us to be able to manage the `Mail Settings`, we need to either manage it from the mail settings in the `cPanel` which we don't have because we are hosting in `DigitalOcean` for total control, or transfer DNS back to `Namecheap BasicDNS` to manage the records and we can't do that and this is causing a blocker because mails don't get delivered to the `Private Mail` - `admin@clariolane.com` nor the `aliases`. <br><br>

SENT from Gmail
<img width="1905" height="326" alt="Image" src="https://github.com/user-attachments/assets/53b775db-93bb-4b3a-935a-05b8b4929971" />

It wasn't received
<img width="1905" height="586" alt="Image" src="https://github.com/user-attachments/assets/e7bab37f-18d7-4434-bf3c-fbdaa12429f1" />

### FIX
1. Go to Namecheap > `Private Email`
<img width="1471" height="344" alt="image" src="https://github.com/user-attachments/assets/8bdad9d4-e95c-42b6-b38e-d046212df3a8" />

2. Manage
<img width="1471" height="397" alt="image" src="https://github.com/user-attachments/assets/a8252ec9-1b95-4ae9-9762-c07ff65f9957" />

3. Setup exactly these DNS Records above in `Digital Ocean`
<img width="1370" height="885" alt="image" src="https://github.com/user-attachments/assets/a1bc4dd0-7145-4025-9d73-8f77e07cf77e" />

Record Type: `MX`
```
mx1.privateemail.com
```
Record Type: `MX`
```
mx2.privateemail.com
```
Record Type: `TXT`
```
v=spf1 include:spf.privateemail.com ~all
```

<img width="1370" height="885" alt="image" src="https://github.com/user-attachments/assets/e80fbca2-6a9e-47af-805e-9537324281a8" />

<img width="1255" height="535" alt="image" src="https://github.com/user-attachments/assets/af3b25bc-56ae-4678-b315-76cc3494bbc6" />

4. This routes everything properly to `admin@clariolane.com` including the `aliases`
<img width="1911" height="845" alt="image" src="https://github.com/user-attachments/assets/45187ade-75f4-48af-82c9-8a4af44790b6" />

### Configure "Send Mail As" for Clariolane Aliases
Enable the primary `admin@clariolane.com` account (hosted via Namecheap Private Email) to send and reply to emails using the `support@clariolane.com`, `info@clariolane.com`, etc identities within the Gmail interface. This allows for a unified "Command Center" for all `Clariolane` communications without paying for multiple mailboxes.

### Acceptance Criteria
- `Inbound Verification:` An email sent to `support@clariolane.com` successfully appears in the `admin@clariolane.com` inbox.
- `Outbound Identity:` When clicking "Compose," a dropdown menu appears allowing a choice between `admin@`, `support@`, `hello@`, `clariolane@` and `info@`.
- `Consistency Check:` A test email sent from the `support@` alias arrives at the recipient's inbox showing `"Clariolane Support"` as the sender (not the admin address).

Technical Configuration Details
- `SMTP Server:` `mail.privateemail.com` or `mx1.privateemail.com`
- `Username:` admin@clariolane.com
- `Port Options:` 465 (SSL) or 587 (TLS)
- `Authentication:` Required (Use the same password as the admin@ account)

Execution Steps
1. `Create Official Gmail:` Create an official Gmail for Clariolane, e.g `officialclariolane@gmail.com`
<img width="1910" height="276" alt="image" src="https://github.com/user-attachments/assets/a53a3850-0a9d-44cf-9e0d-4b8b4325ea33" />

2. `Identity Setup:` Navigate to Gmail Settings > Accounts and Import > Send mail as.
<img width="1910" height="411" alt="image" src="https://github.com/user-attachments/assets/f72803cf-d223-4c0d-b28b-d5f6d89b5c98" />

3. `Add Alias:` Click "Add another email address" and enter the name (e.g., "Clariolane Support" or "Clariolane") and the alias email e.g `support@clariolane.com`
<img width="708" height="679" alt="image" src="https://github.com/user-attachments/assets/73fa6c58-f9d8-42c2-a2f8-6d849a9cbc8e" />

4. `Authentication:` Enter the SMTP details provided above in the `Technical Configuration Details`.
<img width="708" height="679" alt="image" src="https://github.com/user-attachments/assets/44525b08-e71b-4677-a69b-614568c5c271" />

5. `Verification:` Check the `admin@clariolane.com` inbox for the Gmail confirmation code and enter it to verify ownership.

<img width="614" height="281" alt="image" src="https://github.com/user-attachments/assets/889f88f9-0969-469c-8499-8a25982724a6" />
<img width="680" height="451" alt="image" src="https://github.com/user-attachments/assets/06df0a4b-b4e0-4da9-bfa9-f613f4f5a69c" />
<img width="568" height="237" alt="image" src="https://github.com/user-attachments/assets/a2a55cb1-4b3f-4f49-b599-cc4042c72e0c" />
<img width="568" height="237" alt="image" src="https://github.com/user-attachments/assets/7e7f64a6-ec36-44f7-ba97-08c25d2e8129" />

6. `Confirm the email alias addition:`

<img width="1599" height="412" alt="image" src="https://github.com/user-attachments/assets/04a8c1a3-9639-4f19-9f5f-ce3ad4ee1845" />

7. `Behavior Setting:` Under "Send mail as," select the option: "Reply from the same address the message was sent to." (Crucial for brand consistency).

<img width="528" height="129" alt="image" src="https://github.com/user-attachments/assets/13878bc1-89c5-4b88-80fa-392eba9a65d5" />

8. `Repeat:` Perform steps 1–5 for the info@clariolane.com alias.

<img width="650" height="384" alt="image" src="https://github.com/user-attachments/assets/e87f93ee-1b28-4210-a105-963c20105ed4" />

9. `Test:` Send a mail from `officialclariolane@gmail.com` to another mail, but select one of the aliases e.g `support@clariolane.com`

<img width="608" height="319" alt="image" src="https://github.com/user-attachments/assets/0558ea98-6f0d-448f-aa69-f9377fea5c7d" />

Result: <br>

<img width="731" height="338" alt="image" src="https://github.com/user-attachments/assets/42538614-3bb2-4c7e-b059-57fa55858316" />




