const ldap = require('ldapjs')
const PromiseError = require('../promiseErrorClass')

function activateUser (user) {
  return new Promise(
    function (resolve, reject) {
      let changes = []
      let addObjectClass = new ldap.Change({
        operation: 'add',
        modification: {
          objectClass: ['extensibleObject']
        }
      })
      changes.push(addObjectClass)
      let changeInfo = new ldap.Change({
        operation: 'add',
        modification: {
          info: ['active']
        }
      })
      changes.push(changeInfo)
      let changeHomeDir
      if (user.eduPersonAffiliation === 'student') {
        let tmpHomeDir = '/home/' + user.eduPersonAffiliation + '/' + user.eduPersonPrimaryAffiliation + '/' + user.regyear + '/' + user.uid
        changeHomeDir = new ldap.Change({
          operation: 'replace',
          modification: {
            homeDirectory: tmpHomeDir
          }
        })
      } else {
        let tmpHomeDir = '/home/' + user.eduPersonAffiliation + '/' + user.uid
        changeHomeDir = new ldap.Change({
          operation: 'replace',
          modification: {
            homeDirectory: tmpHomeDir
          }
        })
      }
      changes.push(changeHomeDir)
      resolve(changes)
    })
}

function usersExistsAndIsActive (user) {
  return (user && user.info && (user.info === 'active' || (user.info.length > 0 && user.info.includes('active'))))
}

function disableSshFromVM (ldapBinded, user, vmName) {
  return new Promise(
    function (resolve, reject) {
      let disableSsh = new ldap.Change({
        operation: 'delete',
        modification: {
          type: 'info',
          vals: [vmName]
        }
      })
      ldapBinded.modify(user.dn, disableSsh, function (err) {
        if (err) {
          reject(new PromiseError(4011, err))
        } else {
          resolve()
        }
      })
    })
}

function enableSshFromVm (ldapBinded, user, vmName) {
  return new Promise(
    function (resolve, reject) {
      let enableSsh = new ldap.Change({
        operation: 'add',
        modification: {
          info: [vmName]
        }
      })
      ldapBinded.modify(user.dn, enableSsh, function (err) {
        if (err) {
          reject(new PromiseError(4012, err))
        } else {
          resolve()
        }
      })
    })
}

function sshIsActivatedOnVM (user, vmName) {
  return user.info === vmName || (user.info.length > 0 && user.info.includes(vmName))
}

module.exports = {
  activateUser,
  usersExistsAndIsActive,
  disableSshFromVM,
  enableSshFromVm,
  sshIsActivatedOnVM
}
