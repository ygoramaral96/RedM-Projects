fx_version 'cerulean'
game 'rdr3'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

author 'Your Name'
description 'Template Resource'
version '1.0.0'

client_scripts {
    'bin/Template.Client.net.dll'
}

server_scripts {
    'bin/Template.Server.net.dll'
}

ui_page 'web/index.html'

files {
    'web/**/*'
}

