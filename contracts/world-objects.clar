(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-OBJECT-EXISTS (err u101))
(define-constant ERR-OBJECT-NOT-FOUND (err u102))

(define-constant ACCESS-PUBLIC u1)
(define-constant ACCESS-ASSIGNED u2)
(define-constant ACCESS-PREMIUM u3)

(define-data-var contract-owner principal tx-sender)

(define-map objects
  { object-id: (string-ascii 64) }
  {
    zone-key: (string-ascii 64),
    object-type: (string-ascii 32),
    access-mode: uint,
    is-active: bool,
    created-at: uint,
    created-by: principal
  }
)

(define-map object-access
  {
    object-id: (string-ascii 64),
    who: principal
  }
  {
    granted-at: uint,
    granted-by: principal
  }
)

(define-private (is-owner)
  (is-eq tx-sender (var-get contract-owner))
)

(define-private (object-exists (object-id (string-ascii 64)))
  (is-some (map-get? objects { object-id: object-id }))
)

(define-public (register-object
    (object-id (string-ascii 64))
    (zone-key (string-ascii 64))
    (object-type (string-ascii 32))
    (access-mode uint)
    (is-active bool))
  (if (is-owner)
    (if (object-exists object-id)
      ERR-OBJECT-EXISTS
      (let
        (
          (object-record {
            zone-key: zone-key,
            object-type: object-type,
            access-mode: access-mode,
            is-active: is-active,
            created-at: stacks-block-height,
            created-by: tx-sender
          })
        )
        (begin
          (map-set objects { object-id: object-id } object-record)
          (print {
            event: "object-registered",
            object-id: object-id,
            zone-key: zone-key,
            object-type: object-type,
            access-mode: access-mode
          })
          (ok object-record)
        )
      )
    )
    ERR-NOT-AUTHORIZED
  )
)

(define-public (set-object-active (object-id (string-ascii 64)) (is-active bool))
  (if (is-owner)
    (match (map-get? objects { object-id: object-id })
      object-record
      (let
        (
          (updated-object (merge object-record { is-active: is-active }))
        )
        (begin
          (map-set objects { object-id: object-id } updated-object)
          (print {
            event: "object-active-updated",
            object-id: object-id,
            is-active: is-active
          })
          (ok updated-object)
        )
      )
      ERR-OBJECT-NOT-FOUND
    )
    ERR-NOT-AUTHORIZED
  )
)

(define-public (grant-object-access (object-id (string-ascii 64)) (recipient principal))
  (if (is-owner)
    (if (object-exists object-id)
      (let
        (
          (access-record {
            granted-at: stacks-block-height,
            granted-by: tx-sender
          })
        )
        (begin
          (map-set object-access
            {
              object-id: object-id,
              who: recipient
            }
            access-record
          )
          (print {
            event: "object-access-granted",
            object-id: object-id,
            recipient: recipient
          })
          (ok access-record)
        )
      )
      ERR-OBJECT-NOT-FOUND
    )
    ERR-NOT-AUTHORIZED
  )
)

(define-public (revoke-object-access (object-id (string-ascii 64)) (recipient principal))
  (if (is-owner)
    (if (object-exists object-id)
      (begin
        (map-delete object-access
          {
            object-id: object-id,
            who: recipient
          }
        )
        (print {
          event: "object-access-revoked",
          object-id: object-id,
          recipient: recipient
        })
        (ok true)
      )
      ERR-OBJECT-NOT-FOUND
    )
    ERR-NOT-AUTHORIZED
  )
)

(define-read-only (has-object-access (object-id (string-ascii 64)) (who principal))
  (is-some
    (map-get? object-access
      {
        object-id: object-id,
        who: who
      }
    )
  )
)

(define-read-only (can-use-object (object-id (string-ascii 64)) (who principal))
  (match (map-get? objects { object-id: object-id })
    object-record
    (if (get is-active object-record)
      (if (is-eq (get access-mode object-record) ACCESS-PUBLIC)
        true
        (has-object-access object-id who)
      )
      false
    )
    false
  )
)

(define-read-only (get-object (object-id (string-ascii 64)))
  (map-get? objects { object-id: object-id })
)

(define-read-only (get-object-access (object-id (string-ascii 64)) (who principal))
  (map-get? object-access
    {
      object-id: object-id,
      who: who
    }
  )
)

(define-read-only (get-owner)
  (var-get contract-owner)
)
